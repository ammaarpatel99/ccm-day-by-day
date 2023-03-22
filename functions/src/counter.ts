import {db} from "./database";
import {Counter} from "./helpers";
import {
  FieldValue,
  PartialWithFieldValue,
  CollectionReference,
} from "firebase-admin/firestore";

const numShards = 5;


/**
 * Gets the sharded counter values
 */
async function getCount() {
  const querySnapshot = await db.counters.get();
  const documents = querySnapshot.docs;

  const counter: Counter = {
    general: 0, target: 0, waseem: 0, manual: 0,
    pledges: 0, iftarPledges: 0, waseemPledges: 0,
    targetPledges: 0, manualPledges: 0,
  };
  for (const doc of documents) {
    const {
      general, target, waseem, manual,
      pledges, iftarPledges, waseemPledges,
      targetPledges, manualPledges,
    } = doc.data();
    counter.general += general || 0;
    counter.target += target || 0;
    counter.waseem += waseem || 0;
    counter.manual += manual || 0;
    counter.pledges += pledges || 0;
    counter.iftarPledges += iftarPledges || 0;
    counter.waseemPledges += waseemPledges || 0;
    counter.targetPledges += targetPledges || 0;
    counter.manualPledges += manualPledges || 0;
  }
  return counter;
}


interface CountChange {old: number; new: number}
type adjustCounter = { [key in keyof Counter]?: number }
type adjustCounterRes = { [key in keyof Counter]: CountChange }
/**
 * Make a change to the counters.
 * @param {adjustCounter} options
 * @return {adjustCounterRes}
 * A CountChange for each option representing the change in value.
 * Some change may be due to concurrent adjustments.
 * If a change to a value was not attempted, the CountChange will be incorrect.
 */
export async function updateCount(
  options: adjustCounter
): Promise<adjustCounterRes> {
  const increment: PartialWithFieldValue<Counter> = {};
  if (options.general) {
    increment.general = FieldValue.increment(options.general);
  }
  if (options.target) increment.target = FieldValue.increment(options.target);
  if (options.waseem) increment.waseem = FieldValue.increment(options.waseem);
  if (options.manual) increment.manual = FieldValue.increment(options.manual);
  if (options.pledges) {
    increment.pledges = FieldValue.increment(options.pledges);
  }
  if (options.iftarPledges) {
    increment.iftarPledges = FieldValue.increment(options.iftarPledges);
  }
  if (options.waseemPledges) {
    increment.waseemPledges = FieldValue.increment(options.waseemPledges);
  }
  if (options.targetPledges) {
    increment.targetPledges = FieldValue.increment(options.targetPledges);
  }
  if (options.manualPledges) {
    increment.manualPledges = FieldValue.increment(options.manualPledges);
  }

  const shardId = Math.floor(Math.random() * numShards);
  const shardRef = db.counters.doc(shardId.toString());

  const originalValue = await getCount();
  await shardRef.set(increment, {merge: true});
  const newValue = await getCount();

  return {
    target: {old: originalValue.target, new: newValue.target},
    general: {old: originalValue.general, new: newValue.general},
    manual: {old: originalValue.manual, new: newValue.manual},
    waseem: {old: originalValue.waseem, new: newValue.waseem},
    pledges: {old: originalValue.pledges, new: newValue.pledges},
    iftarPledges: {
      old: originalValue.iftarPledges, new: newValue.iftarPledges,
    },
    waseemPledges: {
      old: originalValue.waseemPledges, new: newValue.waseemPledges,
    },
    targetPledges: {
      old: originalValue.targetPledges, new: newValue.targetPledges,
    },
    manualPledges: {
      old: originalValue.manualPledges, new: newValue.manualPledges,
    },
  };
}


/**
 * claim ID
 * @param {CollectionReference} ref
 * @param {number} ID
 * @param {string} donationID
 */
async function setID(
  ref: CollectionReference, ID: number, donationID: string
) {
  await ref.doc(ID.toString()).set(
    {[`${donationID}`]: db.donations.doc(donationID)},
    {merge: true},
  );
}


type IDOptions = {
  general?: boolean; target?: boolean;
  waseem?: boolean; manual?: boolean;
}
type PledgeOptions = {
  general?: number; iftar?: number;
  waseem?: number; target?: number;
  manual?: number;
}
/**
 *
 * @param {string} donationID
 * @param {IDOptions} idOptions
 * @param {PledgeOptions} pledgeOptions
 */
export async function incrementIDsAndPledges(
  donationID: string, idOptions: IDOptions, pledgeOptions: PledgeOptions
) {
  const idValue = (option?: boolean) => option ? 1 : undefined;
  const updateRes = await updateCount({
    general: idValue(idOptions.general),
    target: idValue(idOptions.target),
    manual: idValue(idOptions.manual),
    waseem: idValue(idOptions.waseem),
    pledges: pledgeOptions.general,
    targetPledges: pledgeOptions.target,
    manualPledges: pledgeOptions.manual,
    waseemPledges: pledgeOptions.waseem,
    iftarPledges: pledgeOptions.iftar,
  });

  if (idOptions.general) {
    await setID(db.generalIDs, updateRes.general.old + 1, donationID);
  }
  if (idOptions.target) {
    await setID(db.targetIDs, updateRes.target.old + 1, donationID);
  }
  if (idOptions.manual) {
    await setID(db.manualIDs, updateRes.manual.old + 1, donationID);
  }
  if (idOptions.waseem) {
    await setID(db.waseemIDs, updateRes.waseem.old + 1, donationID);
  }

  return {
    general: updateRes.general.old + 1,
    target: updateRes.target.old + 1,
    manual: updateRes.manual.old + 1,
    waseem: updateRes.waseem.old + 1,
  };
}


/**
 *
 * @param {IDOptions} idOptions
 * @param {PledgeOptions} pledgeOptions
 */
export async function decrementIDsAndPledges(
  idOptions: IDOptions, pledgeOptions: PledgeOptions
) {
  const idValue = (option?: boolean) => option ? -1 : undefined;
  const pledgeValue = (amount?: number) => amount ? -1 * amount : undefined;
  await updateCount({
    general: idValue(idOptions.general),
    target: idValue(idOptions.target),
    manual: idValue(idOptions.manual),
    waseem: idValue(idOptions.waseem),
    pledges: pledgeValue(pledgeOptions.general),
    targetPledges: pledgeValue(pledgeOptions.target),
    manualPledges: pledgeValue(pledgeOptions.manual),
    waseemPledges: pledgeValue(pledgeOptions.waseem),
    iftarPledges: pledgeValue(pledgeOptions.iftar),
  });
}
