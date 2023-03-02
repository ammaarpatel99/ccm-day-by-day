import {https} from "firebase-functions";

const secretAdminPassword = "";

/**
 * checks admin password
 * @param {string} password
 * @return {boolean}
 */
export function isAdminPassword(password: string) {
  return password === secretAdminPassword;
}

/**
 * throw HttpsError if invalid password
 * @param {string} password
 */
export function checkPassword(password: string) {
  if (!isAdminPassword(password)) {
    throw new https.HttpsError("permission-denied", "Invalid admin password");
  }
}
