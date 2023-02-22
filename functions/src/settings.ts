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

const disclaimer = "All money given to the Cambridge Central " +
  "Mosque (CCM) through this scheme is a donation to the Cambridge Mosque " +
  "Trust (CMT) which manages CCM. \n" +
  "Out of those who complete the full Day By Day scheme (£30/day for 30 days " +
  "during Ramadan), the first 300 will be offered the gift of a framed brick " +
  "at a ceremony to take place at CCM. \n" +
  "If you did not select the anonymous option, you consent to your " +
  "name being used publically in a list of donors (such as on a digital wall).";

export const configuration = () => {
  return {
    ramadanStartDate, last10Days, minimumAmount, targetAmount, presetAmounts,
    brickLimit, disclaimer, donationLengths: donationLengths(),
  };
};
