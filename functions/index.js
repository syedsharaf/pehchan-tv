/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASS
  }
});

exports.sendEmailOnNewEntry = functions.firestore
  .document("contacts/{id}")
  .onCreate(async (snap, context) => {

    const data = snap.data();

    const mailOptions = {
      from: "sharafrizvi242@gmail.com",
      to: "sharafrizvi999@gmail.com", // 👈 IMPORTANT: yahan apni email daalo

      subject: "🚀 New Form Submission Received",

      text: `
New Enquiry Received:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Enquiry Type: ${data.enquiry || "Not selected"}

Message:
${data.message}

Submitted At: ${new Date().toLocaleString()}
      `
    };

    await transporter.sendMail(mailOptions);
  });