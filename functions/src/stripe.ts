import Stripe from "stripe";
import {BaseSubscription} from "./database";

// TODO: change stripe key to the live one
const stripeKey = "sk_test_51MOiitFg1jrvwujseQk1ciZYu1dmlmaamxe" +
  "7kaW1jDsYwp59HtyBqKw6JsAxUEHVswfPvaI6XVpgVUYCC11kfVme00KC97UJxx";
const stripe = new Stripe(stripeKey, {apiVersion: "2022-11-15"});

/**
 * creates a Stripe session which creates a customer
 * and sets up their payment method
 * @param {string} email The customer's emails
 * @param {string} successURL The url to redirect to
 * /SESSION_ID will be added to the end of the url.
 */
export async function createSetupSession(email: string, successURL: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "bacs_debit", "sepa_debit"],
    mode: "setup",
    success_url: `${successURL}/{CHECKOUT_SESSION_ID}`,
    customer_creation: "always",
    customer_email: email,
  });
  return session.url as string;
}

/**
 * Gets the stripe session from ID
 * @param {string} sessionID
 */
export async function getSession(sessionID: string) {
  return await stripe.checkout.sessions.retrieve(sessionID);
}

/**
 * Creates a subscription schedule that charges daily.
 * @param {BaseSubscription} data
 * @param {string} customerID
 */
export async function createSubscriptionSchedule(
  data: BaseSubscription,
  customerID: string
) {
  const startDate = Math.floor(data.startDate.toDate().getTime() / 1000);
  return await stripe.subscriptionSchedules.create({
    customer: customerID,
    start_date: startDate,
    end_behavior: "cancel",
    phases: [
      {
        items: [{
          price_data: {
            product: "prod_NNHigc0ZQ201go",
            currency: "gbp",
            recurring: {interval: "day"},
            tax_behavior: "inclusive",
            unit_amount: data.amount * 100,
          },
        }],
        iterations: data.iterations,
      },
    ],
  });
}
