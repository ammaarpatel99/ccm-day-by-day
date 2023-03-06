import {db} from "./database";
import {Counter} from "./helpers";
import {
  FieldValue,
  PartialWithFieldValue,
  CollectionReference,
} from "firebase-admin/firestore";

interface Range {
  min: number; max: number;
}

type incrementCounterRes = {
  [key in keyof Counter]: Range
}

type incrementCounterOptions = {[key in keyof Counter]?: true}

const numShards = 5;

/**
 * Increment the chosen counters
 * @param {incrementCounterOptions} options
 */
export async function incrementCounter(
  options: incrementCounterOptions
): Promise<incrementCounterRes> {
  const originalValue = await getCount();
  const shardId = Math.floor(Math.random() * numShards);
  const shardRef = db.counters.doc(shardId.toString());
  const data: PartialWithFieldValue<Counter> = {};
  if (options.general) data.general = FieldValue.increment(1);
  if (options.target) data.target = FieldValue.increment(1);
  if (options.waseem) data.waseem = FieldValue.increment(1);
  if (options.manual) data.manual = FieldValue.increment(1);
  await shardRef.set(data, {merge: true});
  const newValue = await getCount();
  return {
    target: {min: originalValue.target + 1, max: newValue.target},
    general: {min: originalValue.general + 1, max: newValue.general},
    waseem: {min: originalValue.waseem + 1, max: newValue.waseem},
    manual: {min: originalValue.manual + 1, max: newValue.manual},
  };
}

/**
 * Increment the chosen counters
 * @param {incrementCounterOptions} options
 */
export async function decrementCounter(
  options: incrementCounterOptions
): Promise<void> {
  const shardId = Math.floor(Math.random() * numShards);
  const shardRef = db.counters.doc(shardId.toString());
  const data: PartialWithFieldValue<Counter> = {};
  if (options.general) data.general = FieldValue.increment(-1);
  if (options.target) data.target = FieldValue.increment(-1);
  if (options.waseem) data.waseem = FieldValue.increment(-1);
  if (options.manual) data.manual = FieldValue.increment(-1);
  await shardRef.set(data, {merge: true});
}

/**
 * Gets the sharded counter values
 */
export async function getCount() {
  const querySnapshot = await db.counters.get();
  const documents = querySnapshot.docs;

  const counter: Counter = {general: 0, target: 0, waseem: 0, manual: 0};
  for (const doc of documents) {
    const {general, target, waseem, manual} = doc.data();
    counter.general += general || 0;
    counter.target += target || 0;
    counter.waseem += waseem || 0;
    counter.manual += manual || 0;
  }
  return counter;
}

/**
 * generate IDs
 * @param {string} donationID
 * @param {true | undefined} generateTargetID
 * @param {true | undefined} generateWaseemID
 * @param {true | undefined} generateManualID
 */
export async function generateIDs(
  donationID: string,
  generateTargetID?: true,
  generateWaseemID?: true,
  generateManualID?: true
): Promise<Counter> {
  const {general, target, waseem, manual} = await incrementCounter(
    {
      general: true,
      target: generateTargetID,
      waseem: generateWaseemID,
      manual: generateManualID,
    }
  );
  await setID(db.generalIDs, general.min, donationID);
  if (generateTargetID) await setID(db.targetIDs, target.min, donationID);
  if (generateWaseemID) await setID(db.waseemIDs, waseem.min, donationID);
  if (generateManualID) await setID(db.manualIDs, manual.min, donationID);
  return {
    general: general.min,
    target: target.min,
    waseem: waseem.min,
    manual: manual.min,
  };
}

/**
 * claim ID
 * @param {CollectionReference} ref
 * @param {number} ID
 * @param {string} donationID
 */
async function setID(
  ref: CollectionReference,
  ID: number,
  donationID: string
) {
  await ref.doc(ID.toString()).set(
    {[`${donationID}`]: db.donations.doc(donationID)},
    {merge: true},
  );
}
