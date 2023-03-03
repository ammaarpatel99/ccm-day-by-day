import {Injectable, OnDestroy} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PasswordDialogComponent} from "../password-dialog/password-dialog.component";
import {AsyncSubject, EMPTY, map, Observable, shareReplay, switchMap, takeUntil} from "rxjs";
import {Functions, httpsCallable} from "@angular/fire/functions";
import {collection, Firestore, onSnapshot} from "@angular/fire/firestore";
import {AdminDigitalWallReq, AdminDigitalWallRes, APIEndpoints, Counter} from "../../../../functions/src/api-types";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {saveAs} from 'file-saver-es';

@Injectable({
  providedIn: 'root'
})
export class AdminService implements OnDestroy {
  private readonly destroyed = new AsyncSubject<true>();
  readonly counter = this.getCounter();

  getDigitalWallData() {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminDigitalWallReq, AdminDigitalWallRes>(
          this.functions, APIEndpoints.ADMIN_DIGITAL_WALL
        )({password}));
      }),
      map(res => {
        const data = res.data.map(donor => `${donor.ID},${donor.name}`).join("\n")
        const blob = new Blob([data], { type: "text/csv" });
        saveAs(blob, "digital_wall_donors.csv")
      })
    );
  }

  constructor(
    private readonly matDialog: MatDialog,
    private readonly functions: Functions,
    private readonly firestore: Firestore
  ) { }

  private getPassword() {
    return this.matDialog.open(PasswordDialogComponent).afterClosed()
      .pipe(
        map(x => {
          if (x && typeof x === "string") return x;
          return undefined;
        })
      )
  }

  private getCounter() {
    return new Observable<Counter>(subscriber => {
      onSnapshot(collection(this.firestore, "counters"), snapshot => {
        const counters = snapshot.docs.map(doc => doc.data() as Counter)
        const res: Counter = {waseem: 0, target: 0, general: 0}
        for (const counter of counters) {
          res.general += counter.general || 0
          res.target += counter.target || 0
          res.waseem += counter.waseem || 0
        }
        subscriber.next(res)
      })
    }).pipe(
      shareReplay(1),
      takeUntil(this.destroyed)
    )
  }

  ngOnDestroy(): void {
    this.destroyed.next(true);
    this.destroyed.complete();
  }
}
