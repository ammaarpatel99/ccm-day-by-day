import Stripe from "stripe";
import {
  Application,
  ApplicationWithCustomer,

} from "./helpers";
import {processSubscriptionInfo} from "./processSubscriptionInfo";

// TODO: change stripe key to the live one
// FIXME: roll stripe test key
const stripeKey = "sk_test_51MOiitFg1jrvwujseQk1ciZYu1dmlmaamxe" +
  "7kaW1jDsYwp59HtyBqKw6JsAxUEHVswfPvaI6XVpgVUYCC11kfVme00KC97UJxx";
const stripeProduct = "prod_NOPh6gURBdjBwE";
const stripe = new Stripe(stripeKey, {apiVersion: "2022-11-15"});

/**
 * Make a customer on Stripe
 * @return {string} The customer ID
 */
export async function makeCustomer({email, name, phone, address}: Application) {
  const customer = await stripe.customers.create({
    email, name, phone, metadata: {address},
  });
  return customer.id;
}

/**
 * creates a Stripe session which creates a customer
 * and sets up their payment method.
 * It does not make it the default method.
 * @param {string} customerID The customer's emails
 * @param {string} successURL The url to redirect to
 * "/SESSION_ID" will be added to the end of the url.
 * @return {string} url to redirect user to for payment setup
 */
export async function createSetupSession(
  customerID: string, successURL: string
) {
  const session = await stripe.checkout.sessions.create({
    // TODO: review payment method types accepted
    payment_method_types: ["card", "bacs_debit", "sepa_debit"],
    mode: "setup",
    success_url: `${successURL}/{CHECKOUT_SESSION_ID}`,
    customer: customerID,
  });
  return session.url as string;
}

/**
 * Set the first available payment method on the customer as the default method.
 * Requires the customer to exist.
 * @param {string} customerID
 */
export async function setDefaultPaymentMethod(customerID: string) {
  const paymentMethods = await stripe.customers
    .listPaymentMethods(customerID, {limit: 1});
  const paymentMethod = paymentMethods.data[0].id;
  await stripe.customers.update(customerID,
    {invoice_settings: {default_payment_method: paymentMethod}}
  );
}

/**
 * Creates a subscription schedule that charges daily.
 * @param {Application} data
 * @param {string} donationID
 */
export async function createSubscriptionSchedule(
  data: ApplicationWithCustomer, donationID: string,
) {
  const paymentInfo = processSubscriptionInfo(data);
  return await stripe.subscriptionSchedules.create({
    customer: data.customerID,
    start_date: Math.floor(paymentInfo.startDate / 1000),
    end_behavior: "cancel",
    phases: [
      {
        items: [{
          price_data: {
            product: stripeProduct,
            currency: "gbp",
            recurring: {interval: "day"},
            tax_behavior: "inclusive",
            unit_amount: data.amount * 100,
          },
        }],
        iterations: paymentInfo.iterations,
      },
    ],
    metadata: {
      onBehalfOf: data.onBehalfOf,
      anonymous: JSON.stringify(data.anonymous),
      giftAid: JSON.stringify(data.giftAid),
      firestoreDocID: donationID,
    },
  });
}
