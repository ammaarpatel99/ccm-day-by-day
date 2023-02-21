import * as functions from "firebase-functions";
import {Timestamp} from "firebase-admin/firestore";
import {db} from "./database";
import {
  createSetupSession,
  createSubscriptionSchedule,
  makeCustomer, setDefaultPaymentMethod,
} from "./stripe";
import {sendConfirmationEmail} from "./mail";
import {
  CheckoutSummaryReq,
  CheckoutSummaryRes,
  ConfigRes, PreCheckoutSummaryReq, PreCheckoutSummaryRes,
  SetDefaultPaymentReq,
  SetDefaultPaymentRes,
  SetupPaymentReq,
  SetupPaymentRes, SetupSubscriptionReq, SetupSubscriptionRes,
} from "./api-types";
import {SETTINGS} from "./settings";
import {DonationSubscriptionInfo, processPaymentInfo} from "./helpers";

export const config = functions.https.onCall((): ConfigRes => {
  return SETTINGS;
});

export const setupPayment = functions.https.onCall(
  async (data: SetupPaymentReq): Promise<SetupPaymentRes> => {
    const customerID = await makeCustomer(data);
    const _data: Omit<typeof data, "successURL"> & {successURL?: string} =
      {...data};
    delete _data.successURL;
    const doc = await db.donationApplication.add({..._data, customerID});
    const applicationID = doc.id;
    const setupURL = await createSetupSession(
      customerID, `${data.successURL}/${applicationID}`
    );
    return {setupURL};
  }
);

export const preCheckoutSummary = functions.https.onCall(
  async (data: PreCheckoutSummaryReq): Promise<PreCheckoutSummaryRes> => {
    const paymentInfo = processPaymentInfo(data);
    return {
      ...data, ...paymentInfo,
      startDate: paymentInfo.startDate.getTime(),
    };
  }
);

export const checkoutSummary = functions.https.onCall(
  async (data: CheckoutSummaryReq): Promise<CheckoutSummaryRes> => {
    const doc = await db.donationApplication.doc(data.applicationID).get();
    const docData = doc.data();
    if (!docData) throw new Error("Application doesn't exist");
    const paymentInfo = processPaymentInfo(docData);
    return {
      ...docData, ...paymentInfo,
      startDate: paymentInfo.startDate.getTime(),
    };
  }
);

export const setDefaultPayment = functions.https.onCall(
  async (data: SetDefaultPaymentReq): Promise<SetDefaultPaymentRes> => {
    const doc = await db.donationApplication.doc(data.applicationID).get();
    const docData = doc.data();
    if (!docData) throw new Error("Application doesn't exist");
    await setDefaultPaymentMethod(docData.customerID);
  }
);

export const setupSubscription = functions.https.onCall(
  async (data: SetupSubscriptionReq): Promise<SetupSubscriptionRes> => {
    const doc = await db.donationApplication.doc(data.applicationID).get();
    const docData = doc.data();
    if (!docData) throw new Error("Application doesn't exist");

    const schedule =
      await createSubscriptionSchedule(docData, data.applicationID);
    const paymentInfo = processPaymentInfo(docData);
    const summary = {
      ...docData, ...paymentInfo, scheduleID: schedule.id,
      subscriptionID: schedule.subscription as string,
      created: Timestamp.fromMillis(schedule.created * 1000),
    };

    const emailDoc = await sendConfirmationEmail(summary);
    const donationInfo: DonationSubscriptionInfo = {
      subscriptionID: summary.subscriptionID,
      application: db.donationApplication.doc(data.applicationID),
      created: summary.created,
      confirmationEmail: emailDoc,
      customerID: summary.customerID,
      scheduleID: summary.scheduleID,
    };
    await db.subscriptions.doc(donationInfo.subscriptionID).set(donationInfo);

    return {
      ...summary,
      startDate: summary.startDate.getTime(),
      created: summary.created.toMillis(),
    };
  }
);
