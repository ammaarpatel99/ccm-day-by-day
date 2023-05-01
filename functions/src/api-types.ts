import {configuration} from "./settings";
import {
  Application, ApplicationSummary, SubscriptionSummary, Counter, Subscription,
} from "./helpers";
export {DonationLength, PromoCode, Counter} from "./helpers";

export enum APIEndpoints {
  CONFIG = "config",
  APPLICATION_SUMMARY = "applicationSummary",
  GET_APPLICATION = "getApplication",
  SETUP_PAYMENT = "setupPayment",
  SET_DEFAULT_PAYMENT_METHOD = "setDefaultPayment",
  SETUP_SUBSCRIPTION = "setupSubscription",
  ADMIN_DIGITAL_WALL = "admin-digitalWall",
  ADMIN_DECREMENT_COUNTERS = "admin-decrementCounters",
  ADMIN_ADD_MANUAL = "admin-addManual",
  ADMIN_UPLOAD_DIGITAL_WALL = "admin-uploadDigitalWall",
  CHANGE_PAYMENT_METHOD = "changePaymentMethod",
  ADMIN_GIFT_AID = "admin-giftAid",
  ADMIN_GET_DATA = "admin-getData",
}

export type ConfigReq = void;
export type ConfigRes = ReturnType<typeof configuration>;

export type SetupPaymentReq = Application & { successURL: string };
export type SetupPaymentRes = { setupURL: string };

export type ApplicationSummaryReq = Application;
export type ApplicationSummaryRes = ApplicationSummary;

export type GetApplicationReq = { donationID: string };
export type GetApplicationRes = ApplicationSummary;

export type SetDefaultPaymentReq = {donationID: string};
export type SetDefaultPaymentRes = void;

export type SetupSubscriptionReq = {donationID: string};
export type SetupSubscriptionRes = SubscriptionSummary;

export interface AdminDigitalWallReq {
  password: string;
}
export type AdminDigitalWallRes = {ID: number; name: string}[]

export interface AdminGiftAidReq {
  password: string;
}
export type AdminGiftAidRes = {
  firstName: string;
  surname: string;
  stripeID: string;
  address: string;
  postcode: string;
  email: string;
  phone: string;
  dateOfConsent: number;
  emailSent: boolean;
}[]

export type AdminDecrementCountersReq = {
  password: string;
  counters: Partial<Counter>;
}
export type AdminDecrementCountersRes = void;

export type AdminAddManualReq = {
  password: string;
  onBehalfOf: string;
  anonymous: boolean;
  amount: number;
}
export type AdminAddManualRes = {
  generalID: number;
  manualID: number;
  brickID: number;
};

export interface AdminUploadDigitalWallReq {
  password: string;
  filename: string;
  imageDataURL: string;
}
export interface AdminUploadDigitalWallRes {
  url: string;
}

export interface ChangePaymentMethodReq {
  donationID: string;
  backURL: string;
}

export type ChangePaymentMethodRes = void;

export interface AdminGetDataReq {
  password: string;
}

export interface AdminGetDataRes {
  data: (Subscription & {estimatedTotal: number})[]
}
