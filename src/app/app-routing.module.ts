import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SetupComponent} from "./setup/setup.component";
import {LoadingComponent} from "./loading/loading.component";
import {PaymentSetupComponent} from "./payment-setup/payment-setup.component";

const routes: Routes = [
  {
    path: 'setup',
    component: SetupComponent
  },
  {
    path: 'paymentsetup/:applicationID/:checkoutID',
    component: PaymentSetupComponent
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '',
    pathMatch: 'full',
    component: LoadingComponent
  },
  {
    path: ':promoCode',
    component: LoadingComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
