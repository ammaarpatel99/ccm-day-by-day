import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PasswordDialogComponent} from "../password-dialog/password-dialog.component";
import {EMPTY, map, switchMap} from "rxjs";
import {Functions, httpsCallable} from "@angular/fire/functions";
import {Firestore} from "@angular/fire/firestore";
import {
  AdminAddManualReq, AdminAddManualRes,
  AdminDecrementCounterReq, AdminDecrementCounterRes,
  AdminDigitalWallReq,
  AdminDigitalWallRes, AdminUploadDigitalWallReq, AdminUploadDigitalWallRes,
  APIEndpoints
} from "../../../../functions/src/api-types";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {saveAs} from 'file-saver-es';
import {CountersService} from "../../services/counters.service";

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  readonly counter = this.countersService.counter;

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

  decrementCounter(counters: AdminDecrementCounterReq['counters']) {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminDecrementCounterReq, AdminDecrementCounterRes>(
          this.functions, APIEndpoints.ADMIN_DECREMENT_COUNTER
        )({password, counters}));
      }),
    )
  }

  addManual(options: Omit<AdminAddManualReq, "password">) {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminAddManualReq, AdminAddManualRes>(
          this.functions, APIEndpoints.ADMIN_ADD_MANUAL
        )({password, ...options}));
      }),
    )
  }

  uploadFile(data: Omit<AdminUploadDigitalWallReq, "password">) {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminUploadDigitalWallReq, AdminUploadDigitalWallRes>(
          this.functions, APIEndpoints.ADMIN_UPLOAD_DIGITAL_WALL
        )({...data, password}))
      }),
      map(res => res.data.url)
    )
  }

  constructor(
    private readonly matDialog: MatDialog,
    private readonly functions: Functions,
    private readonly firestore: Firestore,
    private readonly countersService: CountersService
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
}
