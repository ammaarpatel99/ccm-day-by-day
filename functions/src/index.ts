import * as functions from "firebase-functions";
import {Timestamp} from "firebase-admin/firestore";
import {db} from "./database";
import {
  createSetupSession,
  createSubscriptionSchedule,
  getSession,
} from "./stripe";
import {sendConfirmationEmail} from "./mail";
import {StripeSetupData, StripeSetupRes, StripeSubData} from "./api-types";

export const stripeSetup = functions.https.onCall(async (
  data: StripeSetupData, context
): Promise<StripeSetupRes> => {
  context.rawRequest.header("referer");
  const successURL = data.successURL;
  const amount = data.amount;
  const email = data.email;
  const phone = data.phone;
  const name = data.name;
  const wantsBrick = data.wantsBrick;
  const eligibleForBrick = amount >= 30;
  const anonymous = data.anonymous;
  const giftAid = data.giftAid;
  const startDate = new Date(data.startDate);
  const iterations = data.iterations;
  const doc = await db.subscriptions.add({
    name, amount, phone, email, wantsBrick, eligibleForBrick, giftAid,
    iterations, anonymous,
    startDate: Timestamp.fromDate(startDate),
  });
  const docID = doc.id;
  const sessionURL = await createSetupSession(
    email, `${successURL}/${docID}`
  );
  return {sessionURL};
});


export const stripeSub = functions.https.onCall(async (
  data: StripeSubData
): Promise<void> => {
  const sessionID = data.sessionID as string;
  const docID = data.docID as string;
  const docRef = db.subscriptions.doc(docID);
  const doc = await docRef.get();
  const docData = doc.data();
  if (!doc.exists || docData === undefined) {
    throw new Error("Doc doesn't exist");
  }
  const session = await getSession(sessionID);
  const customerID = session.customer as string;
  const schedule = await createSubscriptionSchedule(docData, customerID);
  const scheduleID = schedule.id;
  const subscriptionID = schedule.subscription as string;
  const createdTime = new Date(schedule.created * 1000);
  await docRef.update({
    customerID, scheduleID, subscriptionID,
    created: Timestamp.fromDate(createdTime),
  });
  await sendConfirmationEmail({
    ...docData, customerID, scheduleID, subscriptionID,
    created: Timestamp.fromDate(createdTime),
  }, docID);
});

// TODO: call to get config, including displayed amounts
//  and start date of Ramadan

// TODO: add counters

// TODO: add calls for admin side

// TODO: add call for restarting subscription

// TODO: add call for changing start date of Ramadan
