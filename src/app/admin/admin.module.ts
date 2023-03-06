import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PasswordDialogComponent } from './password-dialog/password-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";


@NgModule({
  declarations: [
    AdminComponent,
    PasswordDialogComponent
  ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        MatDialogModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatCheckboxModule
    ]
})
export class AdminModule { }
