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
  if (data.meetsTarget) {
    if ((data.targetID || 0) < config.brickLimit) {
      brickTxt = "<em>" +
        "Congratulations! You are amongst the first 300 to sign up for" +
        " the full Day By Day Scheme. <strong>If you complete the donation " +
        "of £30 per day for 30 days in Ramadan you will be eligible to " +
        "receive the gift of a framed brick, presented at a ceremony by " +
        "Shaykh Abdal Hakim.</strong></em><br/><br/>";
    } else {
      brickTxt = "<em>" +
        "Congratulations! You have signed up for the full Day By Day " +
        "Scheme. The gift of a framed brick, presented at a ceremony by " +
        "Shaykh Abdal Hakim will be given to the first 300 signups who " +
        "complete the donation of £30 per day for 30 days in Ramadan. " +
        "<strong>Subhan'Allah, we have already had over 300 signups, " +
        "but you are in the waiting list to receive the gift.</strong></em>" +
        "<br/><br/>";
    }
  }
  // TODO: add Gift Aid form
  return await transporter.sendMail({
    to: data.email,
    from: "CCM Day By Day<daybyday@cambridgecentralmosque.org>",
    subject: "CCM Day By Day 2023",
    html: `
<p>Assalamu alaikum wa-rahmatullahi wa-barakatuh,<br/>
[May the peace, mercy, and blessings of Allah be upon you,]<br/>
<br/>${brickTxt}
Thank you for setting up your donation to Cambridge Central Mosque for
Ramadan 2023 through our Day By Day scheme. You should receive invoices
when the donations start. The details of your donation are below:<br/>
<br/>
ID: ${donationID}<br/>
Amount: ${data.amount}<br/>
Start Date: ${new Date(data.startDate).toLocaleDateString()}<br/>
Days: ${data.iterations}<br/>
Initiated: ${new Date(data.created).toLocaleDateString()}<br/>
<br/>
On Behalf of: ${data.onBehalfOf}<br/>
Anonymous: ${data.anonymous ? "Yes" : "No"}<br/>
<br/>
Name: ${data.name}Email: ${data.email}<br/>
Phone Number: ${data.phone}<br/>
Address: ${data.address}<br/>
Gift Aid: ${data.giftAid ? "Yes" : "No"}<br/>
<br/>
Disclaimer:<br/>
${config.disclaimer.replace("\n", "<br/>")}<br/>
<br/>
<br/>
Best wishes,<br/>
Admin Team<br/>
<a href='https://cambridgecentralmosque.org'>Cambridge Central Mosque</a><br/>
<a href='mailto:daybyday@cambridgecentralmosque.org'>
daybyday@cambridgecentralmosque.org</a></p>`,
  });
}
