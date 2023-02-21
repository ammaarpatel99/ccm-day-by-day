import {SETTINGS} from "./settings";
import {
  DonationApplication,
  DonationCheckoutSummaryPayload,
  DonationSummaryPayload,
} from "./helpers";

export enum APIEndpoints {
  CONFIG = "config",
  PRE_CHECKOUT_SUMMARY = "preCheckoutSummary",
  CHECKOUT_SUMMARY = "checkoutSummary",
  SETUP_PAYMENT = "setupPayment",
  SET_DEFAULT_PAYMENT_METHOD = "setDefaultPayment",
  SETUP_SUBSCRIPTION = "setupSubscription"
}

export type ConfigReq = void;
export type ConfigRes = typeof SETTINGS;

export type SetupPaymentReq = DonationApplication & { successURL: string };
export type SetupPaymentRes = { setupURL: string };

export type PreCheckoutSummaryReq = DonationApplication;
export type PreCheckoutSummaryRes = DonationCheckoutSummaryPayload;

export type CheckoutSummaryReq = { applicationID: string };
export type CheckoutSummaryRes = DonationCheckoutSummaryPayload;

export type SetDefaultPaymentReq = {applicationID: string};
export type SetDefaultPaymentRes = void;

export type SetupSubscriptionReq = {applicationID: string};
export type SetupSubscriptionRes = DonationSummaryPayload;
export {DonationLength} from "./donationLength";
