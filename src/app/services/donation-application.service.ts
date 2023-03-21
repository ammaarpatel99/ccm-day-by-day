import {Injectable, OnDestroy} from '@angular/core';
import {DonationLength, PromoCode} from "../../../functions/src/api-types";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ConfigService} from "./config.service";
import {
  AsyncSubject,
  combineLatest,
  filter,
  first,
  map,
  merge,
  shareReplay, startWith,
  takeUntil,
  tap,
  withLatestFrom
} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {NoBrickDialogComponent} from "../no-brick-dialog/no-brick-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class DonationApplicationService implements OnDestroy {
  private readonly destroyed = new AsyncSubject()
  private shownNoBrickDialog = false;
  private _showDonationLengths: false | DonationLength[] = false;
  get showDonationLengths() {return this._showDonationLengths}
  readonly donationLength = new FormControl<DonationLength>(DonationLength.FULL_RAMADAN)
  private _showNoteAboutBackdating = false;
  get showNoteAboutBackdating() {return this._showNoteAboutBackdating}
  private _showPresetAmounts: false | number[] = false
  get showPresetAmounts() {return this._showPresetAmounts}
  readonly donationAmount = new FormControl(0)
  readonly iftarDonationAmount = new FormControl(2.5)
  readonly donationInfo = new FormGroup({
    onBehalfOf: new FormControl("", [Validators.maxLength(25)]),
    anonymous: new FormControl(false, Validators.required)
  })
  readonly donorInfo = new FormGroup({
    firstName: new FormControl("", Validators.required),
    surname: new FormControl("", Validators.required),
    email: new FormControl("", [Validators.required, Validators.email]),
    phone: new FormControl("", Validators.required),
    address: new FormControl("", Validators.required),
    postcode: new FormControl("", Validators.required)
  })
  readonly consent = new FormGroup({
    privacy: new FormControl(false, [Validators.required, Validators.requiredTrue]),
    disclaimer: new FormControl(false, [Validators.required, Validators.requiredTrue]),
    giftAid: new FormControl(false, Validators.required)
  })
  promoCode?: PromoCode;
  readonly amountToMeetTarget = this._amountToMeetTarget();

  constructor(
    private readonly configService: ConfigService,
    private readonly dialog: MatDialog
  ) {
    this.setup().subscribe()
  }

  setup() {
    return this.configService.config$.pipe(
      tap(data => {
        this.setupDonationLengths(data.donationLengths)
        this._showNoteAboutBackdating = this.showBackdatingNote(data.donationLengths, data.ramadanStartDate, data.last10Days)
        this.setupAmounts(data.presetAmounts, data.minimumAmount, data.targetAmount)
        this.noBrickDialog(data.minimumAmount).subscribe()
        this.setupOnBehalfOf().subscribe()
      }),
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
      donationLengths.includes(control.value) ? null : {invalidDonationLength: "invalid donation length"})
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
    this.iftarDonationAmount.addValidators(control =>
      Math.floor(control.value * 100) / 100 === control.value ? null
        : {invalidAmount: `Amount cannot have more than 2 decimal places.`}
    );
  }

  private setupOnBehalfOf() {
    return combineLatest([
      this.donorInfo.controls.firstName.valueChanges,
      this.donorInfo.controls.surname.valueChanges
    ]).pipe(
      map(([firstName, surname]) => {
        if (this.donationInfo.controls.onBehalfOf.pristine) {
          this.donationInfo.controls.onBehalfOf.setValue(`${firstName} ${surname}`);
        }
      }),
      takeUntil(this.destroyed)
    )
  }

  private noBrickDialog(minimumAmount: number) {
    let done = 0;
    return merge(
      this.donationLength.valueChanges.pipe(filter(data => data !== null && data !== DonationLength.FULL_RAMADAN)),
      this.donationAmount.valueChanges.pipe(filter(data => data !== null && data < minimumAmount))
    ).pipe(
      first(),
      tap(() => {
        done++;
        if (done === 1) {
          this.dialog.open(NoBrickDialogComponent)
        }
      }),
      takeUntil(this.destroyed)
    )
  }

  private _amountToMeetTarget() {
    return this.donationLength.valueChanges.pipe(
      startWith(this.donationLength.value),
      withLatestFrom(this.configService.config$),
      map(([length, config]) => {
        let amount = config.targetAmount;
        if (length === DonationLength.REMAINING_DAYS) {
          const date = new Date();
          date.setHours(0, 0, 0, 0);
          const remainingDays = 30 - Math.floor(
            (date.getTime() - config.ramadanStartDate.getTime()) / (1000*60*60*24)
          );
          amount = Math.ceil((amount * 30) / remainingDays);
        } else if (length === DonationLength.LAST_10_DAYS) {
          amount = Math.ceil((amount * 30) / 10);
        }
        if (amount <= config.targetAmount) {
          amount = config.targetAmount;
        }
        if (config.presetAmounts.includes(amount)) {
          return {
            show: false,
            amount
          }
        }
        return {
          show: true,
          amount
        };
      }),
      shareReplay(1)
    )
  }

  ngOnDestroy(): void {
    this.destroyed.next(true)
    this.destroyed.complete()
  }
}
