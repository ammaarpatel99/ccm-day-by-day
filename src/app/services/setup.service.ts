import { Injectable } from '@angular/core';
import {from, map, of, switchMap, tap} from "rxjs";
import {Functions, httpsCallable} from "@angular/fire/functions";
import {
  APIEndpoints,
  CheckoutSummaryReq,
  CheckoutSummaryRes,
  DonationLength,
  PreCheckoutSummaryReq,
  PreCheckoutSummaryRes,
  SetDefaultPaymentReq,
  SetDefaultPaymentRes,
  SetupPaymentReq,
  SetupPaymentRes,
  SetupSubscriptionReq, SetupSubscriptionRes
} from "../../../functions/src/api-types";
import {DonationApplicationService} from "./donation-application.service";

export enum CheckoutState {
  NOT_BEGUN,
  PRE_CHECKOUT_LOADING,
  BEGUN,
  RE_ESTABLISHING,
  PAYMENT_ESTABLISHED,
  PAYMENT_READY,
  COMPLETE
}

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  private readonly successURL = `${location.origin}/payment-setup`;
  private _checkoutState: CheckoutState = CheckoutState.NOT_BEGUN;
  get checkoutState() { return this._checkoutState }
  private checkoutData = {applicationID: '', checkoutID: ''}

  getPreCheckoutSummary() {
    return of(true).pipe(
      tap(() => this._checkoutState = CheckoutState.PRE_CHECKOUT_LOADING),
      switchMap(() =>
        from(httpsCallable<PreCheckoutSummaryReq, PreCheckoutSummaryRes>(this.functions, APIEndpoints.PRE_CHECKOUT_SUMMARY)({
          email: this.applicationService.contactInfo.controls.email.value as string,
          phone: this.applicationService.contactInfo.controls.phone.value as string,
          name: this.applicationService.donorInfo.controls.name.value as string,
          wantsBrick: this.applicationService.donorInfo.controls.wantsBrick.value as boolean,
          giftAid: this.applicationService.consent.controls.giftAid.value as boolean,
          anonymous: this.applicationService.donorInfo.controls.anonymous.value as boolean,
          amount: this.applicationService.donationAmount.value as number,
          donationLength: this.applicationService.donationLength.value as DonationLength
        }))
      ),
      map(({data}) => data),
      tap(() => this._checkoutState = CheckoutState.NOT_BEGUN)
    )
  }

  getCheckoutSummary() {
    return of(true).pipe(
      switchMap(() =>
        from(httpsCallable<CheckoutSummaryReq, CheckoutSummaryRes>(this.functions, APIEndpoints.CHECKOUT_SUMMARY)({
          applicationID: this.checkoutData.applicationID
        }))
      ),
      map(({data}) => data),
      tap(() => this._checkoutState = CheckoutState.PAYMENT_ESTABLISHED)
    )
  }

  setupPayment() {
    return of(true).pipe(
      tap(() => this._checkoutState = CheckoutState.BEGUN),
      switchMap(() =>
        from(httpsCallable<SetupPaymentReq, SetupPaymentRes>(this.functions, APIEndpoints.SETUP_PAYMENT)({
          email: this.applicationService.contactInfo.controls.email.value as string,
          phone: this.applicationService.contactInfo.controls.phone.value as string,
          name: this.applicationService.donorInfo.controls.name.value as string,
          wantsBrick: this.applicationService.donorInfo.controls.wantsBrick.value as boolean,
          giftAid: this.applicationService.consent.controls.giftAid.value as boolean,
          anonymous: this.applicationService.donorInfo.controls.anonymous.value as boolean,
          amount: this.applicationService.donationAmount.value as number,
          donationLength: this.applicationService.donationLength.value as DonationLength,
          successURL: this.successURL
        }))
      ),
      map(({data}) => {
        location.replace(data.setupURL)
      })
    )
  }

  setDefaultPaymentMethod() {
    return of(true).pipe(
      switchMap(() =>
        from(httpsCallable<SetDefaultPaymentReq, SetDefaultPaymentRes>(this.functions, APIEndpoints.SET_DEFAULT_PAYMENT_METHOD)({
          applicationID: this.checkoutData.applicationID
        }))
      ),
      map(() => {}),
      tap(() => this._checkoutState = CheckoutState.PAYMENT_READY)
    )
  }

  setupSubscription() {
    return of(true).pipe(
      switchMap(() =>
        from(httpsCallable<SetupSubscriptionReq, SetupSubscriptionRes>(this.functions, APIEndpoints.SETUP_SUBSCRIPTION)({
          applicationID: this.checkoutData.applicationID
        }))
      ),
      map(({data}) => data),
      tap(() => this._checkoutState = CheckoutState.COMPLETE)
    )
  }

  completePaymentSetup(applicationID: string, checkoutID: string) {
    this._checkoutState = CheckoutState.RE_ESTABLISHING
    this.checkoutData = {applicationID, checkoutID}
  }

  constructor(
    private readonly functions: Functions,
    private readonly applicationService: DonationApplicationService
  ) { }
}
