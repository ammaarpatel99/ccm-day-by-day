import * as functions from "firebase-functions";
import {AdminDigitalWallReq, AdminDigitalWallRes} from "../api-types";
import {checkPassword} from "./password";
import {db} from "../database";

export const digitalWall = functions.https.onCall(
  async (data: AdminDigitalWallReq): Promise<AdminDigitalWallRes> => {
    checkPassword(data.password);
    const donations = await db.donations.get();
    const results: AdminDigitalWallRes = [];
    donations.docs.forEach((doc) => {
      const data = doc.data();
      if (data.status === "application" ||
        data.status === "application_with_customer" ||
        data.targetID === null
      ) {
        return;
      }
      let name = "";
      if (data.tombstone) name += "Tombstone - ";
      if (data.anonymous) name += "Anonymous";
      else name += data.onBehalfOf;
      results.push({ID: data.targetID, name});
    });
    results.sort((a, b) => a.ID - b.ID);
    return results;
  }
);
