import * as functions from "firebase-functions";
import * as cors from "cors";
import Stripe from "stripe";

const stripeKey = "sk_test_51MOiitFg1jrvwujseQk1ciZYu1dmlmaamxe" +
  "7kaW1jDsYwp59HtyBqKw6JsAxUEHVswfPvaI6XVpgVUYCC11kfVme00KC97UJxx";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  cors({origin: true})(request, response, () => {
    response.send({
      data: "Hello from Firebase!",
    });
  });
});

export const stripeCall = functions.https.onRequest((request, response) => {
  cors({origin: true})(request, response, () => {
    const stripe = new Stripe(stripeKey, {apiVersion: "2022-11-15"});
    stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "setup",
      success_url: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://example.com/cancel",
    }).then((session) => {
      if (session.url) {
        response.send({data: session.url});
      } else {
        response.send({data: "error"});
      }
    });
  });
});


