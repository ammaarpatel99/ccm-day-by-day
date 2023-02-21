import {initializeApp} from "firebase-admin/app";
import {
  getFirestore,
  FirestoreDataConverter,
} from "firebase-admin/firestore";
import {DonationInfo, DonationProcessingInfo} from "./helpers";


interface Email {
  to: string;
  message: {
    subject: string;
    html: string;
  }
}

const app = initializeApp();
const firestore = getFirestore(app);

const donationApplicationConverter
  : FirestoreDataConverter<DonationProcessingInfo> = {
    toFirestore(modelObject: DonationProcessingInfo)
      : FirebaseFirestore.DocumentData {
      return modelObject;
    },
    fromFirestore(
      snapshot: FirebaseFirestore.QueryDocumentSnapshot
    ): DonationProcessingInfo {
      return snapshot.data() as DonationProcessingInfo;
    },
  };

const subscriptionConverter: FirestoreDataConverter<DonationInfo> = {
  toFirestore(modelObject: DonationInfo): FirebaseFirestore.DocumentData {
    return modelObject;
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): DonationInfo {
    return snapshot.data() as DonationInfo;
  },
};

const mailConverter: FirestoreDataConverter<Email> = {
  toFirestore(modelObject: Email): FirebaseFirestore.DocumentData {
    return modelObject;
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): Email {
    return snapshot.data() as Email;
  },
};

export const db = {
  donationApplication: firestore.collection("donationApplications")
    .withConverter(donationApplicationConverter),
  subscriptions: firestore.collection("subscriptions")
    .withConverter(subscriptionConverter),
  mail: firestore.collection("mail")
    .withConverter(mailConverter),
};
