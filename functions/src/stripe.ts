import Stripe from "stripe";
import {Application, ApplicationWithCustomer} from "./helpers";
import {processSubscriptionInfo} from "./processSubscriptionInfo";
import {
  stripeDayByDayProduct,
  stripeKey,
  stripeIftarProduct,
} from "./secrets/stripe.secret";

const stripe = new Stripe(stripeKey, {apiVersion: "2022-11-15"});

/**
 * Make a customer on Stripe
 * @return {string} The customer ID
 */
export async function makeCustomer({
  email, firstName, surname, phone, address, postcode,
  giftAid, giftAidConsentDate,
}: Application) {
  const customer = await stripe.customers.create({
    email, name: `${firstName} ${surname}`, phone,
    address: {line1: address, postal_code: postcode},
    metadata: {giftAid: giftAid ? "Yes" : "No", giftAidConsentDate},
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
    payment_method_types: ["card"],
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
  let invoice: Stripe.Response<Stripe.Invoice> | undefined;
  if (paymentInfo.backPay > 0) {
    invoice = await stripe.invoices.create({
      customer: data.customerID,
    });
    await stripe.invoiceItems.create({
      customer: data.customerID,
      price_data: {
        product: stripeDayByDayProduct,
        currency: "gbp",
        tax_behavior: "inclusive",
        unit_amount: paymentInfo.backPay * 100,
      },
      invoice: invoice.id,
      period: {
        start: Math.floor(paymentInfo.backPayPeriod.start / 1000),
        end: Math.floor(paymentInfo.backPayPeriod.end / 1000),
      },
    });
    if (paymentInfo.backPayIftars) {
      await stripe.invoiceItems.create({
        customer: data.customerID,
        price_data: {
          product: stripeIftarProduct,
          currency: "gbp",
          tax_behavior: "inclusive",
          unit_amount: paymentInfo.backPayIftars * 100,
        },
        invoice: invoice.id,
        period: {
          start: Math.floor(paymentInfo.backPayPeriod.start / 1000),
          end: Math.floor(paymentInfo.backPayPeriod.end / 1000),
        },
      });
    }
    invoice = await stripe.invoices.finalizeInvoice(invoice.id);
    try {
      await stripe.invoices.pay(invoice.id);
    } catch (e) {
      console.log(e);
    }
  }
  let subscription: Stripe.Response<Stripe.SubscriptionSchedule> | undefined;
  if (paymentInfo.iterations > 0) {
    const items: Stripe.SubscriptionScheduleCreateParams.Phase.Item[] = [];
    items.push({
      price_data: {
        product: stripeDayByDayProduct,
        currency: "gbp",
        recurring: {interval: "day"},
        tax_behavior: "inclusive",
        unit_amount: data.amount * 100,
      },
    });
    if (data.iftarAmount) {
      items.push({
        price_data: {
          product: stripeIftarProduct,
          currency: "gbp",
          recurring: {interval: "day"},
          tax_behavior: "inclusive",
          unit_amount: data.iftarAmount * 100,
        },
      });
    }
    subscription = await stripe.subscriptionSchedules.create({
      customer: data.customerID,
      start_date: Math.floor(paymentInfo.startDate / 1000),
      end_behavior: "cancel",
      phases: [{
        items,
        billing_cycle_anchor: "phase_start",
        iterations: paymentInfo.iterations,
        metadata: {
          onBehalfOf: data.onBehalfOf,
          anonymous: JSON.stringify(data.anonymous),
          donationID: donationID,
        },
      }],
    });
  }
  if (!subscription && !invoice) {
    throw new Error(
      "Signing up for subscription but nothing will ever be charged"
    );
  }
  return {
    backpayID: invoice?.id,
    subscriptionScheduleID: subscription?.id,
    created: (invoice?.created || subscription?.created || 0) * 1000,
  };
}

/**
 *
 * @param {string} customerID
 * @param {string} backURL
 */
export async function changePaymentMethod(
  customerID: string,
  backURL: string,
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerID,
    return_url: backURL,
    flow_data: {
      type: "payment_method_update",
      after_completion: {
        type: "hosted_confirmation",
      },
    },
  });
  return session.url;
}

/**
 *
 * @param {string} customerID
 */
export async function paymentsByCustomer(customerID: string) {
  let amount = 0;
  const charges = await stripe.charges.list({
    customer: customerID,
    limit: 100,
  });
  charges.data.forEach((charge) => {
    if (charge.status === "succeeded" && !charge.refunded) {
      amount += charge.amount;
    }
  });
  return amount;
}
