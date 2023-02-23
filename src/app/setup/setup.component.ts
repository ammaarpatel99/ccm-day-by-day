import {AfterViewChecked, AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {MatStep, MatStepper} from "@angular/material/stepper";
import {DonationApplicationService} from "../services/donation-application.service";
import {CheckoutState, SetupService} from "../services/setup.service";
import {DonationLength} from "../../../functions/src/api-types";
import {ConfigService} from "../services/config.service";
import {AsyncSubject, map, switchMap, take, takeUntil, tap} from "rxjs";
import {
  ApplicationSummary,
  SubscriptionSummary
} from "../../../functions/src/helpers";
import {FormControl} from "@angular/forms";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stepper') private stepper!: MatStepper;
  @ViewChild('checkoutStep') private checkoutStep!: MatStep;
  showCustomAmount = false
  stepperVertical = true
  private readonly destroyed = new AsyncSubject()
  brickLimit = 0
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
  get donationInfo() {
    return this.applicationService.donationInfo
  }
  get donorInfo() {
    return this.applicationService.donorInfo
  }
  get consent() {
    return this.applicationService.consent
  }
  get minimumAmount() {
    return this.configService.config$.pipe(
      map(data => data.minimumAmount)
    )
  }
  get checkoutState() {
    return this.setupService.checkoutState
  }
  get checkoutStates() {
    return CheckoutState
  }
  get canEdit() {
    return this.checkoutState === this.checkoutStates.NOT_BEGUN
  }
  disclaimer = "";
  giftAidDisclaimer = "";

  get donationLengthComplete() {
    return !this.showDonationLengths || (this.donationLength.valid && this.donationLength.dirty)
  }
  get donationAmountComplete() {
    return this.amount.valid && this.amount.dirty
  }
  get donationDetailsComplete() {
    return this.donationInfo.valid && this.donorInfo.valid
  }
  get consentComplete() {
    return this.consent.valid
  }

  private _checkoutLoadingState: {
    show: boolean; mode: 'indeterminate'|'query'|'determinate'; value: number
  } = {show: false, mode: 'query', value: 0}
  get checkoutLoadingState() {
    return this._checkoutLoadingState
  }

  private _checkoutSummary: ApplicationSummary | null = null;
  get checkoutSummary() {
    return this._checkoutSummary
  }

  private _fullSummary: SubscriptionSummary | null = null;
  get fullSummary() {
    return this._fullSummary
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
    if (
      (this.showDonationLengths === false ? index === 3 : index === 4) &&
      this.checkoutState !== CheckoutState.RE_ESTABLISHING
    ) {
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
    location.replace("https://cambridgecentralmosque.org/daybydaythankyou")
  }

  numberToDate(n: number) {
    return new Date(n)
  }

  errorMessage(control: FormControl) {
    if (control.hasError("required")) return "This field is required";
    if (control.hasError("maxlength")) {
      const err = control.getError("maxlength")
      return `Your input is ${err.actualLength - err.requiredLength} characters too long`;
    }
    if (control.hasError("email")) return "This is not a valid email";
    if (control.hasError("min")) return "The amount must be at least " + control.getError("min").min;
    if (control.invalid) return Object.entries(control.errors || {})[0][1];
    return ""
  }

  constructor(
    private readonly applicationService: DonationApplicationService,
    private readonly setupService: SetupService,
    private readonly configService: ConfigService,
    private readonly breakpointObserver: BreakpointObserver
  ) {
  }

  ngOnInit(): void {
    this.configSetup()
    this.handlePostPaymentSetup()
    this.observeBreakpoints()
  }

  private configSetup() {
    this.configService.config$.subscribe(data => {
      this.disclaimer = data.disclaimer;
      this.giftAidDisclaimer = data.giftAidDisclaimer;
      this.brickLimit = data.brickLimit;
    })
  }

  private handlePostPaymentSetup() {
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

  private observeBreakpoints() {
    this.breakpointObserver.observe(Breakpoints.XSmall).pipe(
      takeUntil(this.destroyed)
    ).subscribe(data => {
      this.stepperVertical = !data.matches
    })
  }

  ngAfterViewInit(): void {
    if (this.checkoutState === CheckoutState.RE_ESTABLISHING) {
      this.checkoutStep.select()
    }
  }

  ngOnDestroy(): void {
    this.destroyed.next(true)
    this.destroyed.complete()
  }
}
