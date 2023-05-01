import * as functions from "firebase-functions";
import {
  AdminAddManualReq,
  AdminAddManualRes,
  AdminDecrementCountersReq,
  AdminDecrementCountersRes,
  AdminDigitalWallReq,
  AdminDigitalWallRes, AdminGetDataReq, AdminGetDataRes,
  AdminGiftAidReq,
  AdminGiftAidRes,
  AdminUploadDigitalWallReq,
  AdminUploadDigitalWallRes,
} from "../api-types";
import {checkPassword} from "./password";
import {db} from "../database";
import {decrementIDsAndPledges, incrementIDsAndPledges} from "../counter";
import {ManualDonation, Subscription} from "../helpers";
import * as stream from "stream";
import {storage} from "../firebase";
import {paymentsByCustomer} from "../stripe";

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

export const giftAid = functions.https.onCall(
  async (data: AdminGiftAidReq): Promise<AdminGiftAidRes> => {
    checkPassword(data.password);
    const donations = await db.donations.get();
    const donors: AdminGiftAidRes = [];
    donations.docs.forEach((doc) => {
      const data = doc.data();
      if (data.status != "subscription" ||
        !data.giftAid
      ) {
        return;
      }
      donors.push({
        address: data.address,
        dateOfConsent: data.giftAidConsentDate,
        email: data.email,
        emailSent: data.emailSent,
        firstName: data.firstName,
        phone: data.phone,
        postcode: data.postcode,
        stripeID: data.customerID,
        surname: data.surname,
      });
    });
    return donors;
  }
);

export const decrementCounters = functions.https.onCall(
  async (
    data: AdminDecrementCountersReq
  ): Promise<AdminDecrementCountersRes> => {
    checkPassword(data.password);
    await decrementIDsAndPledges({
      general: !!data.counters.general,
      waseem: !!data.counters.waseem,
      manual: !!data.counters.manual,
      target: !!data.counters.target,
    }, {
      general: data.counters.pledges,
      target: data.counters.targetPledges,
      waseem: data.counters.waseemPledges,
      manual: data.counters.manualPledges,
      iftar: data.counters.iftarPledges,
    });
  }
);

export const addManual = functions.https.onCall(
  async (data: AdminAddManualReq): Promise<AdminAddManualRes> => {
    checkPassword(data.password);
    const obj: ManualDonation = {
      anonymous: data.anonymous, status: "manual", targetID: -1,
      generalID: -1, manualID: -1, onBehalfOf: data.onBehalfOf,
      amount: data.amount,
    };
    const doc = await db.donations.add(obj);
    const IDs = await incrementIDsAndPledges(
      doc.id, {
        manual: true,
        target: true,
        general: true,
      }, {
        manual: data.amount,
        general: data.amount,
        target: data.amount,
      }
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

export const getData = functions.https.onCall(async (
  data: AdminGetDataReq
): Promise<AdminGetDataRes> => {
  checkPassword(data.password);
  const donations = await db.donations.get();
  const res: AdminGetDataRes["data"] = await Promise.all(donations.docs
    .filter((doc) => {
      const data = doc.data();
      return !(data.status === "application_with_customer" ||
        data.status === "manual" ||
        data.status === "application");
    })
    .map((doc) => doc.data() as Subscription)
    .map(async (data) => {
      const amount = await paymentsByCustomer(data.customerID);
      return {...data, estimatedTotal: amount};
    }));
  return {data: res};
});
