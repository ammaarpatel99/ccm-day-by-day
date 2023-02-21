import {DonationLength} from "./helpers";

const ramadanStartDate = new Date("2023-03-23").getTime();

const _date = new Date(ramadanStartDate);
const last10Days = _date.setDate(_date.getDay() + 20);


const donationLengths = [
  DonationLength.FULL_RAMADAN,
  DonationLength.REMAINING_DAYS,
  DonationLength.LAST_10_DAYS,
];

const minimumAmount = 30;
const presetAmounts = [30, 60, 90];
const targetAmount = 30;

export const SETTINGS = {
  ramadanStartDate, last10Days, paymentSchemes: donationLengths,
  minimumAmount, presetAmounts, targetAmount,
};
