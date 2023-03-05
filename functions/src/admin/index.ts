import * as functions from "firebase-functions";
import {AdminDigitalWallReq, AdminDigitalWallRes} from "../api-types";
import {checkPassword} from "./password";
import {db} from "../database";

export const digitalWall = functions.https.onCall(
  async (data: AdminDigitalWallReq): Promise<AdminDigitalWallRes> => {
    checkPassword(data.password);
    const donations = await db.donations.get();
    const names: AdminDigitalWallRes = [];
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
      names.push({ID: data.targetID, name});
    });
    names.sort((a, b) => a.ID - b.ID);
    const results: AdminDigitalWallRes = [];
    let count = 0;
    let tombstones = 0;
    while (count+tombstones < names.length) {
      const name = names[count+tombstones];
      results.push({ID: count + 1, name: name.name});
      if (name.name.startsWith("Tombstone")) {
        tombstones++;
      } else {
        count++;
      }
    }
    return results;
  }
);
