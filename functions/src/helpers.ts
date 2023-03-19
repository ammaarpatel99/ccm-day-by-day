import {DocumentReference, Timestamp} from "firebase-admin/lib/firestore";

export enum DonationLength {
  FULL_RAMADAN = "full_ramadan",
  REMAINING_DAYS = "remaining_days",
  LAST_10_DAYS = "last_10_days",
}

export interface DonationChoice {
  donationLength: DonationLength;
  amount: number;
  iftarAmount?: number;
}

export enum PromoCode {
  WASEEM = "waseem"
}

interface BaseApplication {
  donationLength: DonationLength;
  amount: number;
  onBehalfOf: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  anonymous: boolean;
  giftAid: boolean;
  giftAidConsentDate: number;
  promoCode?: PromoCode;
  tombstone?: boolean;
  iftarAmount?: number;
}
export interface Application extends BaseApplication {
  status: "application";
}

interface BaseApplicationWithCustomer extends BaseApplication {
  customerID: string;
}
export interface ApplicationWithCustomer extends BaseApplicationWithCustomer {
  status: "application_with_customer";
}

interface BaseSubscription extends BaseApplicationWithCustomer {
  scheduleID: string | undefined;
  lumpSum?: {
    invoiceID: string;
    amount: number;
    iftarAmount: number;
  };
  generalID: number;
  targetID: number | null;
  waseemID: number | null;
  // The time in milliseconds (Date.getTime())
  created: number;
  emailSent: boolean;
}
export interface Subscription extends BaseSubscription {
  status: "subscription";
}

export interface StoredSubscription extends Omit<Subscription, "created"> {
  created: Timestamp;
}

export interface ManualDonation {
  status: "manual";
  onBehalfOf: string;
  generalID: number;
  targetID: number;
  tombstone?: boolean;
  anonymous: boolean;
  manualID: number;
  amount: number;
}

export type Donation =
  Application |
  Subscription |
  ApplicationWithCustomer |
  ManualDonation;
export type StoredDonation =
  Exclude<Donation, Subscription> | StoredSubscription;

export interface ProcessedSubscriptionInfo {
  // The time in milliseconds (Date.getTime())
  startDate: number;
  iterations: number;
  backPay: number;
  backPayIftars: number;
  meetsTarget: boolean;
  backPayPeriod: {
    start: number;
    end: number;
  }
}

export type ApplicationSummary = Application & ProcessedSubscriptionInfo;
export type SubscriptionSummary = Subscription & ProcessedSubscriptionInfo;

/**
 * The difference between 2 dates in days.
 * The dates should be provided as produced by Date.getTime()
 * @param {number} date1 - The latest date (exclusive) in milliseconds
 * @param {number} date2 - The earlier date (inclusive) in milliseconds
 * @return {number} number of days
 */
export function differenceInDays(date1: number, date2: number) {
  return Math.floor((date1 - date2) / (1000*60*60*24));
}

/**
 * The current date with the time removed.
 * @return {Date}
 */
export function dateToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * The current date with the time removed.
 * @return {Date}
 */
export function dateTomorrow() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date.getTime();
}

export interface Counter {
  general: number;
  target: number;
  waseem: number;
  manual: number;
  pledges: number;
  iftarPledges: number;
  waseemPledges: number;
  targetPledges: number;
  manualPledges: number;
}

export interface StoredIDDoc {
  [key: string]: DocumentReference
}
