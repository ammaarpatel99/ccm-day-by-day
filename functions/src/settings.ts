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

export const configuration = () => {
  return {
    ramadanStartDate, last10Days, minimumAmount, targetAmount, presetAmounts,
    brickLimit, donationLengths: donationLengths(),
  };
};
