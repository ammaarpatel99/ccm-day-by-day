import { Injectable } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PasswordDialogComponent} from "../password-dialog/password-dialog.component";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private readonly matDialog: MatDialog
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
