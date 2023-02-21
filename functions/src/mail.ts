import {db} from "./database";
import {DonationSummary} from "./helpers";

/**
 * Sends email confirming of subscription
 * @param {DonationSummary} data
 */
export async function sendConfirmationEmail(data: DonationSummary) {
  // TODO: add Gift Aid form
  return await db.mail.add({
    to: data.email,
    message: {
      subject: "CCM Day By Day 2023 Configured",
      html: "Thank you for setting up your donation to Cambridge Central" +
      " Mosque for Ramadan 2023 through our Day By Day scheme." +
      " The details are below:" +
      "\n\nID: " + data.subscriptionID +
      "\nAmount: " + data.amount +
      "\nStart Date: " + data.startDate.toLocaleDateString() +
      (data.startDate > new Date() ? " (estimate)" : "") +
      "\nDays: " + data.iterations +
      "\nInitiated: " + data.created.toDate().toLocaleDateString() +
      data.eligibleForBrick ?
        "\nWant to be gifted a brick if eligible: " +
        data.wantsBrick ? "Yes" : "No" : "" +
      "\n\nName: " + data.name +
      "\nAnonymous: " + data.anonymous ? "Yes" : "No" +
      "\n\nEmail: " + data.email +
      "\nPhone Number: " + data.phone +
      "\nGift Aid: " + data.giftAid ? "Yes" : "No" +
      "\n\n\nBest wishes," +
      "\nAdmin Team" +
      "\n<a href='cambridgecentralmosque.org'>" +
      "Cambridge Central Mosque</a>" +
      "\n<a href='mailto:daybyday@cambridgecentralmosque.org'>" +
      "daybyday@cambridgecentralmosque.org</a>",
    },
  });
}
