import * as functions from "firebase-functions";
import Stripe from "stripe";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/lib/firestore";

const app = initializeApp();
const firestore = getFirestore(app);

// TODO: change stripe key to the live one
const stripeKey = "sk_test_51MOiitFg1jrvwujseQk1ciZYu1dmlmaamxe" +
  "7kaW1jDsYwp59HtyBqKw6JsAxUEHVswfPvaI6XVpgVUYCC11kfVme00KC97UJxx";
const stripe = new Stripe(stripeKey, {apiVersion: "2022-11-15"});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const stripeSetup = functions.https.onCall(async (data, context) => {
  context.rawRequest.header("referer");
  const successURL = data.successURL as string;
  const amount = data.amount as number;
  const email = data.email as string;
  const phone = data.phone as string;
  const name = data.name as string;
  let brick = data.brick as boolean;
  if (amount < 3000 && brick) brick = false;
  const anonymous = data.anonymous as boolean;
  const giftAid = data.giftAid as boolean;
  const doc = await firestore.collection("subscriptions").add({
    name, brick, anonymous, email, phone, giftAid, amount,
  });
  const docID = doc.id;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "bacs_debit", "sepa_debit"],
    mode: "setup",
    success_url: successURL + `/${docID}/{CHECKOUT_SESSION_ID}`,
    customer_creation: "always",
  });
  const sessionURL = session.url as string;
  return {
    sessionURL: sessionURL,
  };
});

export const stripeSub = functions.https.onCall(async (data) => {
  const sessionID = data.sessionID;
  const price = data.price as number;
  const session = await stripe.checkout.sessions.retrieve(sessionID);
  const customer = session.customer as string;
  const subSchedule = await stripe.subscriptionSchedules.create({
    customer: customer,
    start_date: Math.floor(new Date("2023-03-23").getTime() / 1000),
    end_behavior: "cancel",
    phases: [
      {
        items: [{
          price_data: {
            product: "prod_NNHigc0ZQ201go",
            currency: "gbp",
            recurring: {interval: "day"},
            tax_behavior: "inclusive",
            unit_amount: price,
          },
        }],
        iterations: 30,
      },
    ],
  });
  return subSchedule;
});
