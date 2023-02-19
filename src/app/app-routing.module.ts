import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SetupComponent} from "./setup/setup.component";
import {SuccessComponent} from "./success/success.component";

const routes: Routes = [
  {
    path: 'setup',
    component: SetupComponent
  },
  {
    path: 'success/:session_id',
    component: SuccessComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/setup'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
