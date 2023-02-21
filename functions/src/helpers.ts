import {SETTINGS} from "./settings";
import {DocumentReference, Timestamp} from "firebase-admin/lib/firestore";
import {DonationLength} from "./donationLength";

export interface DonationChoice {
  donationLength: DonationLength;
  amount: number;
}

export interface DonorInfo {
  name: string;
  email: string;
  phone: string;
}

export interface DonationApplication {
  donationLength: DonationLength;
  amount: number;
  name: string;
  email: string;
  phone: string;
  anonymous: boolean;
  wantsBrick: boolean;
  giftAid: boolean;
}

export interface DonationApplicationWithCustomerID extends DonationApplication {
  customerID: string
}

export interface DonationSubscriptionInfo {
  scheduleID: string;
  subscriptionID: string;
  created: Timestamp;
  confirmationEmail: DocumentReference;
  application: DocumentReference;
  customerID: string
}

export enum DonationScheme {
  FULL,
  PARTIAL,
  LAST_10_DAYS,
}

export interface ProcessedDonationInfo {
  startDate: Date;
  donationScheme: DonationScheme;
  eligibleForBrick: boolean;
  iterations: number;
}

export type DonationCheckoutSummary =
  DonationApplication & ProcessedDonationInfo;
export type DonationCheckoutSummaryPayload =
  Omit<DonationCheckoutSummary, "startDate"> & {startDate: number}

export type DonationSummary =
  DonationCheckoutSummary &
  Omit<DonationSubscriptionInfo, "confirmationEmail"|"application">
export type DonationSummaryPayload =
  Omit<DonationSummary, "created"|"startDate"> &
  {created: number; startDate: number}


/**
 * The difference between 2 dates in days.
 * @param {Date} date1 - The latest date (exclusive)
 * @param {Date} date2 - The earlier date (inclusive)
 * @return {number} number of days
 */
function differenceInDays(date1: Date, date2: Date) {
  return Math.floor((date1.getTime() - date2.getTime()) / (1000*60*60*24));
}

/**
 * The current date with the time removed.
 * @return {Date}
 */
function dateToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Produce payment info
 * @param {DonationChoice} data
 * @return {ProcessedDonationInfo}
 */
export function processPaymentInfo(
  data: DonationChoice
): ProcessedDonationInfo {
  if (data.donationLength === DonationLength.LAST_10_DAYS) {
    return {
      startDate: new Date(SETTINGS.last10Days),
      donationScheme: DonationScheme.LAST_10_DAYS,
      eligibleForBrick: false,
      iterations: 10,
    };
  } else if (
    data.donationLength === DonationLength.FULL_RAMADAN &&
    data.amount >= SETTINGS.targetAmount
  ) {
    return {
      startDate: new Date(SETTINGS.ramadanStartDate),
      donationScheme: DonationScheme.FULL,
      eligibleForBrick: true,
      iterations: 30,
    };
  } else if (data.donationLength === DonationLength.FULL_RAMADAN) {
    return {
      startDate: new Date(SETTINGS.ramadanStartDate),
      donationScheme: DonationScheme.PARTIAL,
      eligibleForBrick: false,
      iterations: 30,
    };
  } else {
    const startDate = dateToday();
    const iterations = 30 -
      differenceInDays(startDate, new Date(SETTINGS.ramadanStartDate));
    return {
      startDate: startDate,
      donationScheme: DonationScheme.PARTIAL,
      eligibleForBrick: false,
      iterations,
    };
  }
}
