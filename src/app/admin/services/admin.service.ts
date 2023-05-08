import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PasswordDialogComponent} from "../password-dialog/password-dialog.component";
import {EMPTY, map, switchMap} from "rxjs";
import {Functions, httpsCallable} from "@angular/fire/functions";
import {Firestore} from "@angular/fire/firestore";
import {
  AdminAddManualReq, AdminAddManualRes,
  AdminDecrementCountersReq,
  AdminDecrementCountersRes,
  AdminDigitalWallReq,
  AdminDigitalWallRes, AdminGetDataReq, AdminGiftAidReq, AdminGiftAidRes,
  AdminUploadDigitalWallReq,
  AdminUploadDigitalWallRes,
  APIEndpoints,
  AdminGetDataRes
} from "../../../../functions/src/api-types";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {saveAs} from 'file-saver-es';
import {CountersService} from "../../services/counters.service";

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  readonly counter = this.countersService.counter;

  getDigitalWallData() {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminDigitalWallReq, AdminDigitalWallRes>(
          this.functions, APIEndpoints.ADMIN_DIGITAL_WALL
        )({password}));
      }),
      map(res => {
        const data = res.data.map(donor => `${donor.ID},${donor.name}`).join("\n")
        const blob = new Blob([data], { type: "text/csv" });
        saveAs(blob, "digital_wall_donors.csv")
      })
    );
  }

  getGiftAidData() {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminGiftAidReq, AdminGiftAidRes>(
          this.functions, APIEndpoints.ADMIN_GIFT_AID
        )({password}));
      }),
      map(res => {
        const header = [
          'stripe ID',
          'Date of Consent',
          'First Name',
          'Surname',
          'Email',
          'Phone Number',
          'Address',
          'Postcode',
          'Confirmation Email Sent'
        ].join(",") + "\n";
        const data = res.data.map(donor => [
          donor.stripeID,
          new Date(donor.dateOfConsent).toLocaleDateString(),
          donor.firstName,
          donor.surname,
          donor.email,
          donor.phone,
          donor.address,
          donor.postcode,
          donor.emailSent
        ].map(x => `"${x}"`).join(",")).join("\n")
        const blob = new Blob([header + data], { type: "text/csv" });
        saveAs(blob, "gift_aid.csv")
      })
    );
  }

  decrementCounter(counters: AdminDecrementCountersReq['counters']) {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminDecrementCountersReq, AdminDecrementCountersRes>(
          this.functions, APIEndpoints.ADMIN_DECREMENT_COUNTERS
        )({password, counters}));
      }),
    )
  }

  addManual(options: Omit<AdminAddManualReq, "password">) {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminAddManualReq, AdminAddManualRes>(
          this.functions, APIEndpoints.ADMIN_ADD_MANUAL
        )({password, ...options}));
      }),
    )
  }

  uploadFile(data: Omit<AdminUploadDigitalWallReq, "password">) {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminUploadDigitalWallReq, AdminUploadDigitalWallRes>(
          this.functions, APIEndpoints.ADMIN_UPLOAD_DIGITAL_WALL
        )({...data, password}))
      }),
      map(res => res.data.url)
    )
  }

  getFullData(data: Omit<AdminGetDataReq, "password">) {
    return this.getPassword().pipe(
      switchMap(password => {
        if (!password) {
          console.log("No Password Entered")
          return EMPTY;
        }
        return fromPromise(httpsCallable<AdminGetDataReq, AdminGetDataRes>(
          this.functions, APIEndpoints.ADMIN_GET_DATA
        )({...data, password}))
      }),
      map(res => res.data.data),
      map(res => {
        const header = [
          'Customer ID',
          'First Name',
          'Surname',
          'Email',
          'Phone Number',
          'Address',
          'Postcode',
          'Anonymous',
          'Gift Aid Consent',
          'Gift Aid Consent Date',
          'Subscription Created On',
          'Cancelled Early',
          'Donation Length',
          'Daily Amount',
          'Daily Iftar Amount',
          'Lump Sum Amount',
          'Lump Sum Iftar Amount',
          'Lump Sum Invoice ID',
          'Confirmation Email Sent',
          'Estimated Total Paid (including transaction fees)',
          'On Behalf Of',
          'Promo Code',
          'General ID',
          'Target ID',
          'Schedule ID',
          'Waseem ID'
        ].join(",") + "\n";
        const data = res.map(donor => [
          donor.customerID,
          donor.firstName,
          donor.surname,
          donor.email,
          donor.phone,
          donor.address,
          donor.postcode,
          donor.anonymous,
          donor.giftAid,
          new Date(donor.giftAidConsentDate).toLocaleDateString(),
          new Date(donor.created).toLocaleDateString(),
          donor.tombstone,
          donor.donationLength,
          donor.amount || 0,
          donor.iftarAmount || 0,
          donor.lumpSum?.amount || 0,
          donor.lumpSum?.iftarAmount || 0,
          donor.lumpSum?.invoiceID,
          donor.emailSent,
          donor.estimatedTotal / 100,
          donor.onBehalfOf,
          donor.promoCode,
          donor.generalID,
          donor.targetID,
          donor.scheduleID,
          donor.waseemID
        ].map(x => `"${x}"`).join(",")).join("\n")
        const blob = new Blob([header + data], { type: "text/csv" });
        saveAs(blob, "full_data.csv")
      })
    )
  }


  constructor(
    private readonly matDialog: MatDialog,
    private readonly functions: Functions,
    private readonly firestore: Firestore,
    private readonly countersService: CountersService
  ) { }

  private getPassword() {
    return this.matDialog.open(PasswordDialogComponent).afterClosed()
      .pipe(
        map(x => {
          if (x && typeof x === "string") return x;
          return undefined;
        })
      )
  }
}
