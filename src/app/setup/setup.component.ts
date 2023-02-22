import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatStepper} from "@angular/material/stepper";
import {DonationApplicationService} from "../services/donation-application.service";
import {CheckoutState, SetupService} from "../services/setup.service";
import {DonationLength} from "../../../functions/src/api-types";
import {ConfigService} from "../services/config.service";
import {map, switchMap} from "rxjs";
import {
  DonationCheckoutSummaryPayload,
  DonationSummaryPayload
} from "../../../functions/src/helpers";

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') private stepper!: MatStepper;
  get showDonationLengths() {
    return this.applicationService.showDonationLengths
  }

  get showBackdatingNote() {
    return this.applicationService.showNoteAboutBackdating
  }

  get showPresetAmounts() {
    return this.applicationService.showPresetAmounts
  }

  get amount() {
    return this.applicationService.donationAmount
  }

  get donationLength() {
    return this.applicationService.donationLength
  }

  get donorInfo() {
    return this.applicationService.donorInfo
  }

  get contactInfo() {
    return this.applicationService.contactInfo
  }

  get consent() {
    return this.applicationService.consent
  }

  get eligibleForBrick() {
    return this.applicationService.eligibleForBrick
  }

  get minimumAmount() {
    return this.configService.config$.pipe(
      map(data => data.minimumAmount)
    )
  }

  private _checkoutSummary: DonationCheckoutSummaryPayload | null = null;
  get checkoutSummary() {
    return this._checkoutSummary
  }

  private _fullSummary: DonationSummaryPayload | null = null;
  get fullSummary() {
    return this._fullSummary
  }

  get checkoutState() {
    return this.setupService.checkoutState
  }

  get checkoutStates() {
    return CheckoutState
  }

  private _checkoutLoadingState: {
    show: boolean; mode: 'indeterminate'|'query'|'determinate'; value: number
  } = {show: false, mode: 'query', value: 0}
  get checkoutLoadingState() {
    return this._checkoutLoadingState
  }

  get canEdit() {
    return this.checkoutState === this.checkoutStates.NOT_BEGUN
  }

  get donationLengthComplete() {
    return !this.showDonationLengths || (this.donationLength.valid && this.donationLength.dirty)
  }

  get donationAmountComplete() {
    return this.amount.valid && this.amount.dirty
  }

  get donationDetailsComplete() {
    return this.donorInfo.valid && this.contactInfo.valid && this.consent.valid
  }

  getDonationLengthText(donationLength: DonationLength) {
    switch (donationLength) {
      case DonationLength.FULL_RAMADAN:
        return "30 Days of Ramadan"
      case DonationLength.REMAINING_DAYS:
        return "Remaining Days of Ramadan"
      case DonationLength.LAST_10_DAYS:
        return "Last 10 Days of Ramadan"
    }
  }

  selectDonationLength(donationLength: DonationLength) {
    this.donationLength.setValue(donationLength);
    this.donationLength.markAsDirty();
    setTimeout(() => this.stepper.next(), 100)
  }

  setAmount(amount: number) {
    this.amount.setValue(amount);
    this.amount.markAsDirty();
    setTimeout(() => this.stepper.next(), 100)
  }

  stepperSelectionChange(index: number) {
    if (index === 3) {
      this._checkoutSummary = null
      this._checkoutLoadingState = {show: true, mode: 'query', value: 0}
      this.setupService.getPreCheckoutSummary().subscribe(data => {
        this._checkoutSummary = data
        this._checkoutLoadingState = {show: false, mode: 'query', value: 0}
      })
    }
  }

  setupPayment() {
    this._checkoutLoadingState = {show: true, mode: "indeterminate", value: 0}
    this.setupService.setupPayment().subscribe()
  }

  goToMainSite() {
    location.replace("https://cambridgecentralmosque.org/daybyday")
  }

  numberToDate(n: number) {
    return new Date(n)
  }

  constructor(
    private readonly applicationService: DonationApplicationService,
    private readonly setupService: SetupService,
    private readonly configService: ConfigService
  ) {
  }

  ngOnInit(): void {
    if (this.checkoutState === CheckoutState.RE_ESTABLISHING) {
      this._checkoutLoadingState = {show: true, mode: "indeterminate", value: 0}
      this.setupService.getCheckoutSummary().pipe(
        map(data => {
          this._checkoutSummary = data
          this._checkoutLoadingState = {show: true, mode: "determinate", value: 50}
        }),
        switchMap(() => this.setupService.setDefaultPaymentMethod()),
        map(() => {
          this._checkoutLoadingState = {show: true, mode: "determinate", value: 70}
        }),
        switchMap(() => this.setupService.setupSubscription()),
        map(data => {
          this._checkoutLoadingState = {show: true, mode: "determinate", value: 100}
          this._fullSummary = data
          setTimeout(() => {
            this.stepper.next()
          }, 100)
        })
      ).subscribe()
    }
  }

  ngAfterViewInit(): void {
    if (this.checkoutState === CheckoutState.RE_ESTABLISHING) {
      this.stepper.steps.get(3)?.select()
    }
  }
}
