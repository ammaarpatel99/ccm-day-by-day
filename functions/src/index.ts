import * as functions from "firebase-functions";
import {db} from "./database";
import {
  createSetupSession,
  createSubscriptionSchedule,
  makeCustomer, setDefaultPaymentMethod,
} from "./stripe";
import {
  GetApplicationReq,
  GetApplicationRes,
  ConfigRes, ApplicationSummaryReq, ApplicationSummaryRes,
  SetDefaultPaymentReq,
  SetDefaultPaymentRes,
  SetupPaymentReq,
  SetupPaymentRes, SetupSubscriptionReq, SetupSubscriptionRes,
} from "./api-types";
import {configuration} from "./settings";
import {processSubscriptionInfo} from "./processSubscriptionInfo";
import {ApplicationWithCustomer, Subscription} from "./helpers";
import {generateIDs} from "./counter";
import {sendConfirmationEmail} from "./mail";

export const config = functions.https.onCall((): ConfigRes => {
  return configuration();
});

export const setupPayment = functions.https.onCall(
  async (data: SetupPaymentReq): Promise<SetupPaymentRes> => {
    const customerID = await makeCustomer(data);
    const _data: Omit<typeof data, "successURL"> & {successURL?: string} =
      {...data};
    const docData: ApplicationWithCustomer = {
      ...data, status: "application_with_customer", customerID,
    };
    delete _data.successURL;
    const doc = await db.donations.add(docData);
    const applicationID = doc.id;
    const setupURL = await createSetupSession(
      customerID, `${data.successURL}/${applicationID}`
    );
    return {setupURL};
  }
);

export const applicationSummary = functions.https.onCall(
  async (data: ApplicationSummaryReq): Promise<ApplicationSummaryRes> => {
    const paymentInfo = processSubscriptionInfo(data);
    return {...data, ...paymentInfo};
  }
);

export const getApplication = functions.https.onCall(
  async (data: GetApplicationReq): Promise<GetApplicationRes> => {
    const doc = await db.donations.doc(data.donationID).get();
    const docData = doc.data();
    if (!docData) throw new Error("Application doesn't exist");
    const paymentInfo = processSubscriptionInfo(docData);
    return {
      ...docData, ...paymentInfo, status: "application",
    };
  }
);

export const setDefaultPayment = functions.https.onCall(
  async (data: SetDefaultPaymentReq): Promise<SetDefaultPaymentRes> => {
    const doc = await db.donations.doc(data.donationID).get();
    const docData = doc.data();
    if (!docData) throw new Error("Application doesn't exist");
    if (docData.status === "application") {
      throw new Error("Application doesn't have customerID set");
    }
    await setDefaultPaymentMethod(docData.customerID);
  }
);

export const setupSubscription = functions.https.onCall(
  async (data: SetupSubscriptionReq): Promise<SetupSubscriptionRes> => {
    const doc = db.donations.doc(data.donationID);
    const docData = (await doc.get()).data();
    if (!docData) throw new Error("Application doesn't exist");
    if (docData.status !== "application_with_customer") {
      throw new Error("Application in incorrect state");
    }
    const paymentInfo = processSubscriptionInfo(docData);
    const schedule =
      await createSubscriptionSchedule(docData, data.donationID);
    const IDs = await generateIDs(
      data.donationID, paymentInfo.meetsTarget || undefined
    );
    const subscription: Subscription = {
      ...docData, status: "subscription", generalID: IDs.general,
      targetID: IDs.target, scheduleID: schedule.id,
      created: schedule.created * 1000, emailSent: false,
    };
    await doc.set(subscription);
    await sendConfirmationEmail(
      {...subscription, ...paymentInfo}, data.donationID
    );
    subscription.emailSent = true;
    await doc.set(subscription);
    return {...subscription, ...paymentInfo};
  }
);
