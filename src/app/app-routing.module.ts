import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SetupComponent} from "./setup/setup.component";
import {SetupSuccessComponent} from "./setup-success/setup-success.component";
import {SubscriptionComponent} from "./subscription/subscription.component";
import {LoadingComponent} from "./loading/loading.component";

const routes: Routes = [
  {
    path: 'setup',
    component: SetupComponent
  },
  {
    path: 'setup/success/:doc_id/:session_id',
    component: SetupSuccessComponent
  },
  {
    path: 'subscription',
    component: SubscriptionComponent
  },
  {
    path: '',
    component: LoadingComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
