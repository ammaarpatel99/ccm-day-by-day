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
  return await transporter.sendMail({
    to: data.email,
    from: "CCM Day By Day<daybyday@cambridgecentralmosque.org>",
    subject: "Confirmation: Ramadan Day By Day Donations " +
      "– Cambridge Central Mosque",
    html: `
<p>Assalamu ‘alaykum wa rahmatullah wa barakatuh,<br/>
May the peace, mercy, and blessings of Allah be upon you,<br/><br/>
<em>Thank you for donating to Cambridge Central Mosque.</em><br/>

${data.meetsTarget && ((data.targetID || 0) <= config.brickLimit) ? `
<em>Alhamdulillah! You are amongst the first 300 people to set up donations of
at least £30 per day for each of the 30 days of Ramadan.</em><br/><br/>
You will receive an invoice for each donation when this begins.<br/><br/>
<strong>Once complete, you will become eligible to receive your gift, a framed
brick from the original build of Cambridge Central Mosque, presented at a
ceremony by Shaykh Abdal Hakim Murad.</strong>
` : `
<em>Alhamdulillah! You have successfully set up daily donations for the holy
month of Ramadan.</em> You will receive an invoice for each donation when
this begins.
`}<br/>

<br/>
If you have any questions, reply to this email, and we will endeavour to
respond as soon as possible.<br/>
<br/>
<h3>Donation Details:</h3>
Reference: <em>${donationID}</em><br/>
${data.lumpSum ?
    `Lump Sum Donation: <em>£${data.lumpSum.amount}</em><br/>` :
    ""}
${data.scheduleID ?
    `Daily Amount: <em>£${data.amount}</em><br/>` +
    "Start Date: <em>" +
    `${new Date(data.startDate).toLocaleDateString("en-UK")}` +
    "</em><br/>" +
    `Days: <em>${data.iterations}</em><br/>` : ""}
Initiated: <em>${new Date(data.created).toLocaleDateString("en-UK")}</em><br/>
On Behalf of: <em>${data.onBehalfOf}</em><br/>
Anonymous: <em>${data.anonymous ? "Yes" : "No"}</em><br/>
<br/>
<h3>Your Details:</h3>
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
${config.giftAidDisclaimer}<br/>
<h5>Gift Aid Info:</h5>
${config.giftAidUpdatesDisclaimer}<br/>
`}
<br/>
<h3>Day By Day Disclaimer:</h3>
${config.disclaimer}<br/>
<br/>
<br/>
Thank you for supporting Cambridge Central Mosque,<br/>
Admin Team<br/>
<a href='https://cambridgecentralmosque.org'>Cambridge Central Mosque</a><br/>
<a href='mailto:daybyday@cambridgecentralmosque.org'>
daybyday@cambridgecentralmosque.org</a><br/>
<img
 src="https://cambridgecentralmosque.org/wp-content/uploads/2019/03/logo-ccm-retina-2.png"
 alt="Cambridge Central Mosque Logo"
 ><br/>
<strong>©The Cambridge Mosque Trust | Registered UK Charity No. 1164931</strong>
</p>
`,
  });
}
