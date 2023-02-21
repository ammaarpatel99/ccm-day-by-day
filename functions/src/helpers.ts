import {SETTINGS} from "./settings";
import {DocumentReference, Timestamp} from "firebase-admin/lib/firestore";
import {DonationLength} from "./donationLength";

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


export interface DonationChoice {
  donationLength: DonationLength;
  amount: number;
}

export interface DonorInfo {
  name: string;
  email: string;
  phone: string;
}

export interface DonationAdditionalInfo {
  anonymous: boolean;
  wantsBrick: boolean;
  giftAid: boolean;
}

export interface DonationApplication extends
  DonationChoice, DonorInfo, DonationAdditionalInfo
{ }


export interface DonorID {
  customerID: string;
}

export interface DonationProcessingInfo extends
  DonationApplication, DonorID {}

export interface DonationInfo extends DonorID {
  scheduleID: string;
  subscriptionID: string;
  created: Timestamp;
  confirmationEmail: DocumentReference;
  application: DocumentReference;
}


export interface DonationCheckoutSummary extends
  Omit<DonationApplication, "donationLength">,
  Omit<ProcessedDonationInfo, "donationScheme"> {}

export interface DonationSummary extends
  DonationCheckoutSummary,
  Omit<DonationInfo, "confirmationEmail"|"application"> {}

export interface DonationCheckoutSummaryPayload extends
  Omit<DonationApplication, "donationLength">,
  Omit<ProcessedDonationInfo, "donationScheme" | "startDate"> {
  startDate: number
}

export interface DonationSummaryPayload extends
  DonationCheckoutSummaryPayload,
  Omit<DonationInfo, "confirmationEmail"|"application"|"created"> {
  created: number
}


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


/**
 * @param {DonationApplication} data
 */
export function produceDonationSummary
(data: DonationApplication): DonationCheckoutSummary
/**
 * @param {DonationApplication} data
 * @param {string} subscriptionID
 */
export function produceDonationSummary
(data: DonationApplication, subscriptionID: string): DonationSummary
/**
 * @param {DonationApplication} data
 * @param {string | void} subscriptionID
 * @return {DonationCheckoutSummary | DonationSummary}
 */
export function produceDonationSummary(
  data: DonationApplication, subscriptionID?: string
): DonationCheckoutSummary | DonationSummary {
  const _data = {...data, ...(processPaymentInfo(data))};
  if (!subscriptionID) return _data;
  else return {..._data, subscriptionID};
}
