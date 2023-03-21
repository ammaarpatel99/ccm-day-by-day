import {configuration} from "./settings";
import {
  dateToday,
  differenceInDays,
  DonationChoice,
  ProcessedSubscriptionInfo,
  DonationLength, dateTomorrow,
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
  let partialRes: Omit<ProcessedSubscriptionInfo,
    "backPay"|"backPayPeriod"|"backPayIftars"
  > | undefined;
  if (data.donationLength === DonationLength.LAST_10_DAYS) {
    partialRes = {
      startDate: config.last10Days,
      meetsTarget: false,
      iterations: 10,
    };
  } else if (
    data.donationLength === DonationLength.FULL_RAMADAN
  ) {
    partialRes = {
      startDate: config.ramadanStartDate,
      meetsTarget: data.amount >= config.targetAmount,
      iterations: 30,
    };
  } else {
    const startDate = dateToday();
    const iterations = 30 -
      differenceInDays(startDate, config.ramadanStartDate);
    partialRes = {
      startDate: startDate,
      meetsTarget: false,
      iterations,
    };
  }
  if (partialRes.iterations * data.amount >= config.targetAmount * 30) {
    partialRes.meetsTarget = true;
  }
  if (partialRes.startDate > new Date().getTime()) {
    return {...partialRes, backPay: 0, backPayIftars: 0,
      backPayPeriod: {start: partialRes.startDate, end: partialRes.startDate},
    };
  }
  const tomorrow = dateTomorrow();
  const backPayIterations = differenceInDays(tomorrow, partialRes.startDate);
  const backPayAmount = backPayIterations * data.amount;
  const backPayIftarAmount = backPayIterations * (data.iftarAmount || 0);
  let remainingIterations = partialRes.iterations - backPayIterations;
  if (remainingIterations < 0) remainingIterations = 0;
  return {
    startDate: tomorrow,
    iterations: remainingIterations,
    backPay: backPayAmount,
    backPayIftars: backPayIftarAmount,
    meetsTarget: partialRes.meetsTarget,
    backPayPeriod: {
      start: partialRes.startDate,
      end: tomorrow - 1000, // end is today at 23:59:59
    },
  };
}
