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

/**
 * Increment the chosen counters
 * @param {incrementCounterOptions} options
 */
export async function incrementCounter(
  options: incrementCounterOptions
): Promise<incrementCounterRes> {
  const originalValue = await getCount();
  const numShards = 5;
  const shardId = Math.floor(Math.random() * numShards);
  const shardRef = db.counters.doc(shardId.toString());
  const data: PartialWithFieldValue<Counter> = {};
  if (options.general) data.general = FieldValue.increment(1);
  if (options.target) data.target = FieldValue.increment(1);
  await shardRef.set(data, {merge: true});
  const newValue = await getCount();
  return {
    target: {min: originalValue.target + 1, max: newValue.target},
    general: {min: originalValue.general + 1, max: newValue.general},
  };
}

/**
 * Gets the sharded counter values
 */
export async function getCount() {
  const querySnapshot = await db.counters.get();
  const documents = querySnapshot.docs;

  const counter: Counter = {general: 0, target: 0};
  for (const doc of documents) {
    const {general, target} = doc.data();
    counter.general += general;
    counter.target += target;
  }
  return counter;
}

/**
 * generate IDs
 * @param {string} donationID
 * @param {true | undefined} generateTargetID
 */
export async function generateIDs(
  donationID: string, generateTargetID?: true
): Promise<Counter> {
  const {general, target} = await incrementCounter(
    {general: true, target: generateTargetID}
  );
  await setID(db.generalIDs, general.min, donationID);
  if (generateTargetID) await setID(db.targetIDs, target.min, donationID);
  return {general: general.min, target: target.min};
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
