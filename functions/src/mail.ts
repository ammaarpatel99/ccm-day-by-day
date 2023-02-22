import {SubscriptionSummary} from "./helpers";
import {createTransport} from "nodemailer";
import {configuration} from "./settings";

const transporter = createTransport({
  port: 587, host: "smtp.office365.com", auth: {
    user: "daybyday@cambridgecentralmosque.org",
    pass: "Hav06296",
  },
});

/**
 * Sends email confirming of subscription
 * @param {SubscriptionSummary} data
 * @param {string} donationID
 */
export async function sendConfirmationEmail(
  data: SubscriptionSummary, donationID: string,
) {
  const config = configuration();
  let brickTxt = "";
  if (!data.meetsTarget) {
    if ((data.targetID || 0) < config.brickLimit) {
      brickTxt =
        "\n\nCongratulations! You are amongst the first 300 to sign up for" +
        " the full Day By Day Scheme. If you complete the donation of £30 " +
        "per day for 30 days in Ramadan you will be eligible to receive the " +
        "gift of a framed brick, presented at a ceremony by " +
        "Shaykh Abdal Hakim.\n\n";
    } else {
      brickTxt =
        "\n\nCongratulations! You have signed up for the full Day By Day " +
        "Scheme. The gift of a framed brick, presented at a ceremony by " +
        "Shaykh Abdal Hakim will be given to the first 300 signups who " +
        "complete the donation of £30 per day for 30 days in Ramadan. " +
        "Subhan'Allah, we have already had over 300 signups, but you are in " +
        "the waiting list to receive the gift.\n\n";
    }
  }
  // TODO: add Gift Aid form
  return await transporter.sendMail({
    to: data.email,
    subject: "CCM Day By Day 2023",
    text: "Thank you for setting up your donation to Cambridge Central" +
    " Mosque for Ramadan 2023 through our Day By Day scheme." +
    brickTxt +
    " The details of your donation are below:" +
    "\n\nID: " + donationID +
    "\nAmount: " + data.amount +
    "\nStart Date: " + new Date(data.startDate).toLocaleDateString() +
    "\nDays: " + data.iterations +
    "\nInitiated: " + new Date(data.created).toLocaleDateString() +
    "\n\nOn Behalf of: " + data.onBehalfOf +
    "\nAnonymous: " + data.anonymous ? "Yes" : "No" +
    "\n\nName: " + data.name +
    "Email: " + data.email +
    "\nPhone Number: " + data.phone +
    "\nAddress: " + data.address +
    "\nGift Aid: " + data.giftAid ? "Yes" : "No" +
    "\n\nDisclaimer:\n" + config.disclaimer +
    "\n\n\nBest wishes," +
    "\nAdmin Team" +
    "\n<a href='cambridgecentralmosque.org'>" +
    "Cambridge Central Mosque</a>" +
    "\n<a href='mailto:daybyday@cambridgecentralmosque.org'>" +
    "daybyday@cambridgecentralmosque.org</a>",
  });
}
