import { Component } from '@angular/core';
import {ChangePaymentMethodService} from "../services/change-payment-method.service";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-change-payment-method',
  templateUrl: './change-payment-method.component.html',
  styleUrls: ['./change-payment-method.component.scss']
})
export class ChangePaymentMethodComponent {
  status: "start" | "loading" | "success" | "error" = "start"

  readonly donationID = new FormControl("", Validators.required)

  changePaymentMethod() {
    const donationID = this.donationID.value
    if (!donationID) {
      this.status = "error"
      return
    }
    this.status = "loading"
    this.changePaymentMethodService.changePaymentMethod(donationID).subscribe(
      res => {
        this.donationID.reset("")
        if (res) this.status = "success"
        else this.status = "error"
      }
    )
  }

  constructor(
    private readonly changePaymentMethodService: ChangePaymentMethodService
  ) {
  }

}
