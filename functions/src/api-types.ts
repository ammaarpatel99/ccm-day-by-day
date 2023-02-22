import {configuration} from "./settings";
import {
  Application, ApplicationSummary, SubscriptionSummary,
} from "./helpers";
export {DonationLength} from "./helpers";

export enum APIEndpoints {
  CONFIG = "config",
  APPLICATION_SUMMARY = "applicationSummary",
  GET_APPLICATION = "checkoutSummary",
  SETUP_PAYMENT = "setupPayment",
  SET_DEFAULT_PAYMENT_METHOD = "setDefaultPayment",
  SETUP_SUBSCRIPTION = "setupSubscription"
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
