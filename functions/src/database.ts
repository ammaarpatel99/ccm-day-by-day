import {
  FirestoreDataConverter,
  Timestamp,
} from "firebase-admin/firestore";
import {
  Counter, Donation,
  StoredDonation, StoredIDDoc,
} from "./helpers";
import {firestore} from "./firebase";

const donationConverter: FirestoreDataConverter<Donation> = {
  toFirestore(modelObject: Donation): FirebaseFirestore.DocumentData {
    let data: StoredDonation | undefined;
    if (modelObject.status !== "subscription") {
      data = modelObject;
    } else {
      data = {
        ...modelObject,
        created: Timestamp.fromMillis(modelObject.created),
      };
    }
    return data;
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): Donation {
    const _data = snapshot.data() as StoredDonation;
    let data: Donation | undefined;
    if (_data.status !== "subscription") {
      data = _data;
    } else {
      data = {
        ..._data,
        created: _data.created.toMillis(),
      };
    }
    return data;
  },
};

const counterConverter: FirestoreDataConverter<Counter> = {
  toFirestore(modelObject: Counter): FirebaseFirestore.DocumentData {
    return modelObject;
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): Counter {
    return snapshot.data() as Counter;
  },
};

const IDDocConverter: FirestoreDataConverter<StoredIDDoc> = {
  toFirestore(
    modelObject: FirebaseFirestore.WithFieldValue<StoredIDDoc>
  ): FirebaseFirestore.DocumentData {
    return modelObject;
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): StoredIDDoc {
    return snapshot.data() as StoredIDDoc;
  },
};

export const db = {
  donations: firestore.collection("donations")
    .withConverter(donationConverter),
  counters: firestore.collection("counters")
    .withConverter(counterConverter),
  generalIDs: firestore.collection("generalIDs")
    .withConverter(IDDocConverter),
  targetIDs: firestore.collection("targetIDs")
    .withConverter(IDDocConverter),
};
