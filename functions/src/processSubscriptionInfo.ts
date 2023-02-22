import {configuration} from "./settings";
import {
  dateToday,
  differenceInDays,
  DonationChoice,
  ProcessedSubscriptionInfo,
  DonationLength,
} from "./helpers";

/**
 * Produce payment info
 * @param {DonationChoice} data
 * @return {ProcessedSubscriptionInfo}
 */
export function processSubscriptionInfo(
  data: DonationChoice,
): ProcessedSubscriptionInfo {
  const config = configuration();
  if (data.donationLength === DonationLength.LAST_10_DAYS) {
    return {
      startDate: config.last10Days,
      meetsTarget: false,
      iterations: 10,
    };
  } else if (
    data.donationLength === DonationLength.FULL_RAMADAN &&
    data.amount >= config.targetAmount
  ) {
    return {
      startDate: config.ramadanStartDate,
      meetsTarget: true,
      iterations: 30,
    };
  } else if (data.donationLength === DonationLength.FULL_RAMADAN) {
    return {
      startDate: config.ramadanStartDate,
      meetsTarget: false,
      iterations: 30,
    };
  } else {
    const startDate = dateToday();
    const iterations = 30 -
      differenceInDays(startDate, config.ramadanStartDate);
    return {
      startDate: startDate,
      meetsTarget: false,
      iterations,
    };
  }
}
