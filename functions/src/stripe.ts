import Stripe from "stripe";
import {
  DonationChoice,
  DonationProcessingInfo,
  DonationScheme, DonorInfo,
  processPaymentInfo,
} from "./helpers";

// TODO: change stripe key to the live one
// FIXME: roll stripe test key
const stripeKey = "sk_test_51MOiitFg1jrvwujseQk1ciZYu1dmlmaamxe" +
  "7kaW1jDsYwp59HtyBqKw6JsAxUEHVswfPvaI6XVpgVUYCC11kfVme00KC97UJxx";
const stripe = new Stripe(stripeKey, {apiVersion: "2022-11-15"});

enum Product {
  FULL_SCHEME = "prod_NOPdvEJI9cTqO4",
  PARTIAL_SCHEME = "prod_NOPfwfyWvxemAO",
  LAST_10_DAYS = "prod_NOPgvVnUse2LbEprod_NOPgvVnUse2LbE",
}

interface PaymentInfo {
  product: Product,
  iterations: number,
  startDate: Date
}

/**
 * @param {DonationScheme} donationScheme
 * @return {Product}
 */
function donationSchemeToProduct(donationScheme: DonationScheme) {
  switch (donationScheme) {
  case DonationScheme.FULL:
    return Product.FULL_SCHEME;
  case DonationScheme.PARTIAL:
    return Product.PARTIAL_SCHEME;
  case DonationScheme.LAST_10_DAYS:
    return Product.LAST_10_DAYS;
  }
}

/**
 * @param {DonationChoice} data
 * @return {PaymentInfo}
 */
function producePaymentInfo(data: DonationChoice): PaymentInfo {
  const info = processPaymentInfo(data);
  return {
    ...info,
    product: donationSchemeToProduct(info.donationScheme),
  };
}


/**
 * Make a customer on Stripe
 * @return {string} The customer ID
 */
export async function makeCustomer({email, name, phone}: DonorInfo) {
  const customer = await stripe.customers.create({email, name, phone});
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
 * @param {DonationProcessingInfo} data
 * @param {string} applicationID
 */
export async function createSubscriptionSchedule(
  data: DonationProcessingInfo, applicationID: string,
) {
  const paymentInfo = producePaymentInfo(data);
  return await stripe.subscriptionSchedules.create({
    customer: data.customerID,
    start_date: Math.floor(paymentInfo.startDate.getTime() / 1000),
    end_behavior: "cancel",
    phases: [
      {
        items: [{
          price_data: {
            product: paymentInfo.product,
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
      name: data.name,
      anonymous: JSON.stringify(data.anonymous),
      giftAid: JSON.stringify(data.giftAid),
      wantsBrick: JSON.stringify(data.wantsBrick),
      firestoreDocID: applicationID,
    },
  });
}
