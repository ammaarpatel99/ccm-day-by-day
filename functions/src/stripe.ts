import Stripe from "stripe";
import {BaseSubscription} from "./database";
import {SETTINGS} from "./settings";

// TODO: change stripe key to the live one
const stripeKey = "sk_test_51MOiitFg1jrvwujseQk1ciZYu1dmlmaamxe" +
  "7kaW1jDsYwp59HtyBqKw6JsAxUEHVswfPvaI6XVpgVUYCC11kfVme00KC97UJxx";
const stripe = new Stripe(stripeKey, {apiVersion: "2022-11-15"});

enum Products {
  FULL_SCHEME = "prod_NOPdvEJI9cTqO4",
  PARTIAL_SCHEME = "prod_NOPfwfyWvxemAO",
  LAST_10_DAYS = "prod_NOPgvVnUse2LbEprod_NOPgvVnUse2LbE",
  ONE_OFF = "prod_NOPgvVnUse2LbE"
}

/**
 * Make a customer on Stripe
 * @param {string} email
 * @param {string} name
 * @param {string} phone
 * @return {string} The customer ID
 */
export async function makeCustomer(email: string, name: string, phone: string) {
  const customer = await stripe.customers.create({email, name, phone});
  return customer.id;
}

/**
 * creates a Stripe session which creates a customer
 * and sets up their payment method.
 * It does not make it the default method.
 * @param {string} email The customer's emails
 * @param {string} successURL The url to redirect to
 * "/SESSION_ID" will be added to the end of the url.
 * @return {string} url to redirect user to for payment setup
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
 * @param {BaseSubscription} data
 */
export async function createSubscriptionSchedule(data: BaseSubscription) {
  const startDate = Math.floor(data.startDate.toDate().getTime() / 1000);
  const last10Days =
    data.startDate.toDate().getTime() == SETTINGS.last10Days.getTime();
  const product = data.eligibleForBrick ? Products.FULL_SCHEME :
    last10Days ? Products.LAST_10_DAYS : Products.PARTIAL_SCHEME;
  return await stripe.subscriptionSchedules.create({
    customer: data.customerID,
    start_date: startDate,
    end_behavior: "cancel",
    phases: [
      {
        items: [{
          price_data: {
            product,
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
