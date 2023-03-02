import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-password-dialog',
  templateUrl: './password-dialog.component.html',
  styleUrls: ['./password-dialog.component.scss']
})
export class PasswordDialogComponent {
  password = ""

  constructor(
    private readonly dialogRef: MatDialogRef<PasswordDialogComponent>
  ) { }

  close(submit: boolean = false) {
    this.dialogRef.close(submit ? this.password : undefined);
  }
}
