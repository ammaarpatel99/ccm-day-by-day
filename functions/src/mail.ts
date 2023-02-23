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
when the donations start.<br/>
<br/>
<h3>Donation Details:</h3>
Reference: <em>${donationID}</em><br/>
Amount: <em>${data.amount}</em><br/>
Start Date: <em>${new Date(data.startDate).toLocaleDateString("en-UK")}
</em><br/>
Days: <em>${data.iterations}</em><br/>
Initiated: <em>${new Date(data.created).toLocaleDateString("en-UK")}</em><br/>
<br/>
On Behalf of: <em>${data.onBehalfOf}</em><br/>
Anonymous: <em>${data.anonymous ? "Yes" : "No"}</em><br/>
<br/>
<h3>Donor Details:</h3>
Name: <em>${data.firstName} ${data.surname}</em><br/>
Email: <em>${data.email}</em><br/>
Phone Number: <em>${data.phone}</em><br/>
Address: <em>${data.address}</em><br/>
Postcode: <em>${data.postcode}</em><br/>
<br/>
<h3>Gift Aid:</h3>
Consent to Gift Aid: <em>${data.giftAid ? "Yes" : "No"}</em><br/>
${!data.giftAid ? "" : `
Date of consent:
<em>${new Date(data.giftAidConsentDate).toLocaleDateString("en-UK")}</em>
<br/>
<h4>Gift Aid Disclaimer:</h4>
${config.giftAidDisclaimer}${config.giftAidUpdatesDisclaimer}<br/>
`}
<br/>
<h3>Day By Day Disclaimer:</h3>
${config.disclaimer}<br/>
<br/>
<br/>
Best wishes,<br/>
Admin Team<br/>
<a href='https://cambridgecentralmosque.org'>Cambridge Central Mosque</a><br/>
<a href='mailto:daybyday@cambridgecentralmosque.org'>
daybyday@cambridgecentralmosque.org</a></p>`,
  });
}
