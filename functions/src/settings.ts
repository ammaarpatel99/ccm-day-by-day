import {dateToday, differenceInDays, DonationLength} from "./helpers";

const ramadanStartDate = new Date("2023-02-23").getTime();

const _date = new Date(ramadanStartDate);
const last10Days = _date.setDate(_date.getDate() + 20);

const donationLengths = () => {
  const lengths = [DonationLength.FULL_RAMADAN];
  if (differenceInDays(dateToday(), ramadanStartDate) >= 1) {
    lengths.push(DonationLength.REMAINING_DAYS);
  }
  return lengths;
};

const minimumAmount = 30;
const presetAmounts = [30, 40, 50];
const targetAmount = 30;

const brickLimit = 300;

const disclaimer = `All money given to the Cambridge Central Mosque
through this scheme is a donation to the Registered UK Charity 1164931
“The Cambridge Mosque Trust”.<br/><br/>
If you are among the first 300 to set up donations of at least £30 for the
full 30 days of Ramadan, you will be offered a framed brick with the option
to receive it at a ceremony held in Cambridge; details TBC. This includes
those commencing during Ramadan who donate for the days they've missed.<br/>
<br/>
If you did not select the “Anonymous” option, you consent to the name entered
under “Donate on Behalf of” being published on our Digital Wall, website,
social media & elsewhere, all of which will be accessible to members of the
public via the internet.<br/><br/>
<em>[Please note: The Cambridge Mosque Trust reserves the right to change the
terms of issuing this gift at its own discretion, and without advance notice.
Thank you for your understanding.]</em>
`;

const giftAidDisclaimer = `I am a UK taxpayer. I want The
Cambridge Mosque Trust <i>(Registered UK Charity 1164931)</i> to treat
all gifts of money that I have made in the past four years, and all future
gifts of money that I make from the date of this declaration, as Gift Aid
donations.<br/><br/>
I understand that if I pay less Income Tax and/or Capital Gains Tax than the
amount of Gift Aid claimed on all my donations in that tax year it is my
responsibility to pay any difference.`;

const giftAidUpdatesDisclaimer = `
Please notify The Cambridge Mosque Trust if you:
<ul>
<li>want to cancel this declaration</li>
<li>change your name or home address</li>
<li>no longer pay sufficient tax on your income and/or capital gains</li>
</ul>
If you pay Income Tax at the higher or additional rate and want to receive
the additional tax relief due to you, you must include all your Gift Aid
donations on your Self-Assessment tax return or ask HM Revenue and Customs to
adjust your tax code.`;

export const configuration = () => {
  return {
    ramadanStartDate, last10Days, minimumAmount, targetAmount, presetAmounts,
    brickLimit, disclaimer, giftAidDisclaimer, giftAidUpdatesDisclaimer,
    donationLengths: donationLengths(),
  };
};
