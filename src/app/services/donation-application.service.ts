import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {DonationLength} from "../../../functions/src/api-types";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ConfigService} from "./config.service";
import {AsyncSubject, shareReplay, startWith, switchMap, takeUntil, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DonationApplicationService implements OnDestroy {
  private readonly destroyed = new AsyncSubject()

  private _showDonationLengths: false | DonationLength[] = false;
  get showDonationLengths() {return this._showDonationLengths}
  readonly donationLength = new FormControl<DonationLength>(DonationLength.FULL_RAMADAN)
  private _showNoteAboutBackdating = false;
  get showNoteAboutBackdating() {return this._showNoteAboutBackdating}
  private _showPresetAmounts: false | number[] = false
  get showPresetAmounts() {return this._showPresetAmounts}
  readonly donationAmount = new FormControl(0)
  private _eligibleForBrick = false
  get eligibleForBrick() {return this._eligibleForBrick}
  readonly donorInfo = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.minLength(2), Validators.maxLength(25)]),
    anonymous: new FormControl(false, Validators.required),
    wantsBrick: new FormControl(true, Validators.required)
  })
  readonly contactInfo = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    phone: new FormControl("", Validators.required)
  })
  readonly consent = new FormGroup({
    giftAid: new FormControl(false, Validators.required),
    privacy: new FormControl(false, [Validators.required, Validators.requiredTrue]),
    disclaimer: new FormControl(false, [Validators.required, Validators.requiredTrue])
  })

  constructor(
    private readonly configService: ConfigService
  ) {
    this.setupWithConfig().subscribe()
  }

  setupWithConfig() {
    return this.configService.config$.pipe(
      tap(data => {
        this.setupDonationLengths(data.donationLengths)
        this._showNoteAboutBackdating = this.showBackdatingNote(data.donationLengths, data.ramadanStartDate, data.last10Days)
        this.setupAmounts(data.presetAmounts, data.minimumAmount, data.targetAmount)
      }),
      switchMap(data => this.setupEligibleForBrick(data.targetAmount)),
      shareReplay(1),
      takeUntil(this.destroyed)
    )
  }

  private setupDonationLengths(donationLengths: DonationLength[]) {
    this._showDonationLengths = donationLengths.length > 1 ? donationLengths : false
    if (donationLengths.includes(DonationLength.FULL_RAMADAN)) {
      this.donationLength.setValue(DonationLength.FULL_RAMADAN)
    } else this.donationLength.setValue(donationLengths[0])
    this.donationLength.addValidators(control =>
      donationLengths.includes(control.value) ? null : {invalidDonationLength: "invalidDonationLength"})
  }

  private showBackdatingNote(donationLengths: DonationLength[], ramadanStartDate: Date, last10Days: Date) {
    if (donationLengths.includes(DonationLength.FULL_RAMADAN) && new Date() > ramadanStartDate) {
      return true
    } else if (donationLengths.includes(DonationLength.LAST_10_DAYS) && new Date() > last10Days) {
      return true
    }
    return false
  }

  private setupAmounts(presetAmounts: number[], minimum: number, target: number) {
    this._showPresetAmounts = presetAmounts.length === 0 ? false : presetAmounts
    this.donationAmount.setValue(target)
    this.donationAmount.addValidators([
      Validators.required, Validators.min(minimum),
      control =>
        Math.floor(control.value * 100) / 100 === control.value ? null
          : {invalidAmount: `Amount cannot have more than 2 decimal places.`}
    ])
  }

  private setupEligibleForBrick(targetAmount: number) {
    return this.donationAmount.valueChanges.pipe(
      startWith(0),
      tap(amount => {
        this._eligibleForBrick = !!amount && amount >= targetAmount
      })
    )
  }

  ngOnDestroy(): void {
    this.destroyed.next(true)
    this.destroyed.complete()
  }
}
