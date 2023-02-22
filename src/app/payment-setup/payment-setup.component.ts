import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SetupService} from "../services/setup.service";

@Component({
  selector: 'app-payment-setup',
  templateUrl: './payment-setup.component.html',
  styleUrls: ['./payment-setup.component.scss']
})
export class PaymentSetupComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly setupService: SetupService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const applicationID = params.get('applicationID') as string;
      const checkoutID = params.get('checkoutID') as string;
      this.setupService.completePaymentSetup(applicationID, checkoutID)
      setTimeout(() => this.router.navigate(['/', 'setup']))
    })
  }

}
