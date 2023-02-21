import {initializeApp} from "firebase-admin/app";
import {
  getFirestore,
  FirestoreDataConverter,
} from "firebase-admin/firestore";
import {
  DonationSubscriptionInfo,
  DonationApplicationWithCustomerID,
} from "./helpers";


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
  : FirestoreDataConverter<DonationApplicationWithCustomerID> = {
    toFirestore(modelObject: DonationApplicationWithCustomerID)
      : FirebaseFirestore.DocumentData {
      return modelObject;
    },
    fromFirestore(
      snapshot: FirebaseFirestore.QueryDocumentSnapshot
    ): DonationApplicationWithCustomerID {
      return snapshot.data() as DonationApplicationWithCustomerID;
    },
  };

const subscriptionConverter
  : FirestoreDataConverter<DonationSubscriptionInfo> = {
    toFirestore(
      modelObject: DonationSubscriptionInfo
    ): FirebaseFirestore.DocumentData {
      return modelObject;
    },
    fromFirestore(
      snapshot: FirebaseFirestore.QueryDocumentSnapshot
    ): DonationSubscriptionInfo {
      return snapshot.data() as DonationSubscriptionInfo;
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
