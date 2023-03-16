import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";

export const app = initializeApp();
export const firestore = getFirestore(app);
firestore.settings({ignoreUndefinedProperties: true});
export const storage = getStorage(app);
