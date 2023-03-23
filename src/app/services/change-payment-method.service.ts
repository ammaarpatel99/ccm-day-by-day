import { Injectable } from '@angular/core';
import {Functions, httpsCallable} from "@angular/fire/functions";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {
  APIEndpoints,
  ChangePaymentMethodReq,
  ChangePaymentMethodRes,
} from "../../../functions/src/api-types";
import {catchError, map, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChangePaymentMethodService {
  changePaymentMethod(donationID: string) {
    return fromPromise(
      httpsCallable<ChangePaymentMethodReq, ChangePaymentMethodRes>(
        this.functions, APIEndpoints.CHANGE_PAYMENT_METHOD
      )({donationID, backURL: location.href})
    ).pipe(
      map(() => {
        return true;
      }),
      catchError(err => {
        console.log(err)
        return of(false);
      })
    )
  }

  constructor(
    private readonly functions: Functions
  ) { }
}
