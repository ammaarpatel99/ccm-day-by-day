import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {environment} from "../environments/environment";
import {connectFunctionsEmulator, getFunctions, provideFunctions} from "@angular/fire/functions";
import { SetupComponent } from './setup/setup.component';
import {MatCardModule} from "@angular/material/card";
import {MatStepperModule} from "@angular/material/stepper";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { LoadingComponent } from './loading/loading.component';
import { PaymentSetupComponent } from './payment-setup/payment-setup.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import { NoBrickDialogComponent } from './no-brick-dialog/no-brick-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {connectFirestoreEmulator, provideFirestore, getFirestore} from "@angular/fire/firestore";

@NgModule({
  declarations: [
    AppComponent,
    SetupComponent,
    LoadingComponent,
    PaymentSetupComponent,
    NoBrickDialogComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFunctions(() => {
            const functions = getFunctions();
            if (!environment.production) {
                connectFunctionsEmulator(functions, 'localhost', 5001);
            }
            return functions;
        }),
        provideFirestore(() => {
          const firestore = getFirestore();
          if (!environment.production) {
            connectFirestoreEmulator(firestore, 'localhost', 8080);
          }
          return firestore;
        }),
        MatCardModule,
        MatStepperModule,
        MatButtonModule,
        MatInputModule,
        MatDividerModule,
        FormsModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatDialogModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
