import {Component, OnInit} from '@angular/core';
import {Functions, httpsCallable} from "@angular/fire/functions";

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  constructor(
    private readonly functions: Functions
  ) { }

  ngOnInit(): void {

  }

  setupPayment() {
    httpsCallable<any, any>(this.functions, 'stripeSetup')({
      successURL: `${location.origin}/success/`,
      cancelURL: `${location.origin}`
    }).then(res => {
      window.location.href = res.data.sessionURL;
    })
  }
}
