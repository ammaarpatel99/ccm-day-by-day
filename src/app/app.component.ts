import { Component } from '@angular/core';
import {Functions, httpsCallable} from "@angular/fire/functions";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(functions: Functions) {
    httpsCallable<any, any>(functions, 'stripeCall')().then(res => {
      console.log(res)
      window.location.href = res.data;
    })
  }

}
