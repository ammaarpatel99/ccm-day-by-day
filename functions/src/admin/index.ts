import * as functions from "firebase-functions";
import {
  AdminAddManualReq, AdminAddManualRes,
  AdminDecrementCounterReq,
  AdminDecrementCounterRes,
  AdminDigitalWallReq,
  AdminDigitalWallRes, AdminUploadDigitalWallReq, AdminUploadDigitalWallRes,
} from "../api-types";
import {checkPassword} from "./password";
import {db} from "../database";
import {decrementCounter as decrementCounterFn, generateIDs} from "../counter";
import {ManualDonation} from "../helpers";
import * as stream from "stream";
import {storage} from "../firebase";

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
      if (data.anonymous || !data.onBehalfOf) name += "Anonymous";
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

export const decrementCounter = functions.https.onCall(
  async (data: AdminDecrementCounterReq): Promise<AdminDecrementCounterRes> => {
    checkPassword(data.password);
    await decrementCounterFn({
      general: data.counters.general || undefined,
      waseem: data.counters.waseem || undefined,
      target: data.counters.target || undefined,
    });
  }
);

export const addManual = functions.https.onCall(
  async (data: AdminAddManualReq): Promise<AdminAddManualRes> => {
    checkPassword(data.password);
    const obj: ManualDonation = {
      anonymous: data.anonymous, status: "manual", targetID: -1,
      generalID: -1, manualID: -1, onBehalfOf: data.onBehalfOf,
    };
    const doc = await db.donations.add(obj);
    const IDs = await generateIDs(
      doc.id, true, undefined, true
    );
    await db.donations.doc(doc.id).update({
      manualID: IDs.manual,
      generalID: IDs.general,
      targetID: IDs.target,
    });
    return {
      manualID: IDs.manual,
      generalID: IDs.general,
      brickID: IDs.target,
    };
  }
);

export const uploadDigitalWall = functions.https.onCall(
  async (
    data: AdminUploadDigitalWallReq
  ): Promise<AdminUploadDigitalWallRes> => {
    checkPassword(data.password);
    const image = data.imageDataURL;
    const mimeType = image.match(
      /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1];
    const fileName = data.filename;
    // trim off the part of the payload that is not part of the base64 string
    const base64EncodedImageString =
      image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64EncodedImageString, "base64");
    const bufferStream = new stream.PassThrough();
    bufferStream.end(imageBuffer);
    // Define file and fileName
    const file = storage.bucket().file(fileName);
    const url = await new Promise<string>((resolve, reject) => {
      bufferStream.pipe(file.createWriteStream({
        metadata: {
          contentType: mimeType,
        },
        public: true,
      }))
        .on("error", (err) => {
          console.log("error from image upload", err);
          reject(err);
        })
        .on("finish", () => {
          // The file upload is complete.
          resolve(file.publicUrl());
        });
    });
    return {url};
  }
);
