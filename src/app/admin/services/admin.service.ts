import { Injectable } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PasswordDialogComponent} from "../password-dialog/password-dialog.component";
import {EMPTY, map, switchMap} from "rxjs";
import {Functions, httpsCallable} from "@angular/fire/functions";
import {AdminDigitalWallReq, AdminDigitalWallRes, APIEndpoints} from "../../../../functions/src/api-types";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {saveAs} from 'file-saver-es';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

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
    private readonly functions: Functions
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
