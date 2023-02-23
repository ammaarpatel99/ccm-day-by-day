import {dateToday, differenceInDays, DonationLength} from "./helpers";

const ramadanStartDate = new Date("2023-03-23").getTime();

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

const disclaimer = `All money given to the Cambridge Central Mosque (CCM)
through this scheme is a donation to the Cambridge Mosque Trust (CMT) which
manages CCM.<br/>
Out of those who complete the full Day By Day scheme (£30/day for 30 days
during Ramadan), the first 300 will be offered the gift of a framed brick at
a ceremony to take place at CCM.<br/>
If you did not select the anonymous option, you consent to your name being used
publicly in a list of donors (such as on a digital wall).`;

const giftAidDisclaimer = `I am a UK taxpayer. I want The
Cambridge Mosque Trust <i>(registered UK charity number: 1164931)</i> to treat
all gifts of money that I have made in the past four years, and all future
gifts of money that I make from the date of this declaration, as Gift Aid
donations.<br/>
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
the additional tax reliefdue to you, you must include all your Gift Aid
donations on your Self-Assessment tax return or ask HM Revenue and Customs to
adjust your tax code.`;

export const configuration = () => {
  return {
    ramadanStartDate, last10Days, minimumAmount, targetAmount, presetAmounts,
    brickLimit, disclaimer, giftAidDisclaimer, giftAidUpdatesDisclaimer,
    donationLengths: donationLengths(),
  };
};
