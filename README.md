# Day By Day – Cambridge Central Mosque

This system was built for the Cambridge Central Mosque to use for their Day By Day scheme during Ramadan 2023.

This code was authored primarily by Ammaar Patel. No-one may use this code without the permission of Ammaar Patel, and no-one may
use any branding or likeness of Cambridge Central Mosque without the permission of the Cambridge Mosque Trust
(the charity behind Cambridge Central Mosque).

The program uses:
- Stripe
- An email connected via a nodemailer transporter
- Firebase Hosting, Firestore and Firebase Functions
- Firebase Storage for uploading an image for the digital wall

The code is built using Angular and Angular Material, and is a web-based system.

## Setup

`/functions/src/secrets` contains example files for the secrets that need making.
The files names should match the names of the example files. i.e. `stripe.secret.ts`
should be made and should export values of the same type as that exported by `stripe.secret.example.ts`.

Firebase CLI needs to be setup on your local machine, and the firebase config needs to be entered into
the files in `/src/environments`. The firebase config files also need updating to match your firebase project.

Firebase emulators should also be setup with the default ports for local testing.

## Testing

- Replace the Stripe details in `/functions/src/secrets/stripe.secret.ts` with those of the Stripe 
test environment.
- Adjust any other secrets as you please (such as the email transporter).
- Launch the Firebase emulators for Storage, Firestore and Functions.
- run `ng serve`
- access the site on `localhost:4200`

## Deploying

- Make sure the secrets are the production ones, not the testing equivalents.
- Run `ng deploy` to compile and launch the site.
- Run `firebase deploy --only functions,firestore,storage` to launch the server functions and storage/database rules.
