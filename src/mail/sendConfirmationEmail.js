// const nodemailer = require("nodemailer");
// const isDev = process.env.NODE_ENV !== "production";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: isDev ? { rejectUnauthorized: false } : undefined,
// });

// async function sendConfirmationEmail(toEmail, confirmationLink) {
//   const mailOptions = {
//     from: `"RepAIr" <${process.env.EMAIL_USER}>`,
//     to: toEmail,
//     subject: "Confirmez votre adresse email",
//     html: `
//       <h2>Bienvenue sur RepAIr !</h2>
//       <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
//       <a href="${confirmationLink}">Confirmer mon email</a>
//     `,
//   };

//   // return transporter.sendMail(mailOptions);
//   try {
//     return await transporter.sendMail(mailOptions);
//   } catch (err) {
//     console.error("Nodemailer sendMail error:", {
//       message: err?.message,
//       code: err?.code,
//       command: err?.command,
//       response: err?.response,       // ← réponse SMTP brute
//       responseCode: err?.responseCode
//     });
//     throw err; // on remonte pour que la route renvoie 500 avec détails
//   }
// }

// module.exports = sendConfirmationEmail;





// notif_service/src/mail/sendConfirmationEmail.js
// const nodemailer = require("nodemailer");

// const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
// const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
// const isDev = process.env.NODE_ENV !== "production";

// // Logs utiles (en dev)
// console.log("[MAIL] user =", EMAIL_USER);
// console.log("[MAIL] pass length =", EMAIL_PASS.length); // doit être 16 avec app password

// // Transport Gmail (SSL 465) + tolérance TLS en DEV si besoin
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: { user: EMAIL_USER, pass: EMAIL_PASS },
//   tls: isDev ? { rejectUnauthorized: false, servername: "smtp.gmail.com" } : { servername: "smtp.gmail.com" },
// });

// // Vérif SMTP (utile en dev)
// transporter.verify((err) => {
//   if (err) console.error("SMTP verify failed:", err);
//   else console.log("SMTP ready");
// });

// // ✅ Définition de la fonction (elle doit exister avant l’export)
// async function sendConfirmationEmail(toEmail, confirmationLink) {
//   const mailOptions = {
//     from: `"RepAIr" <${EMAIL_USER}>`,
//     to: toEmail,
//     subject: "Confirmez votre adresse email",
//     html: `
//       <h2>Bienvenue sur RepAIr !</h2>
//       <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email :</p>
//       <a href="${confirmationLink}">Confirmer mon email</a>
//     `,
//   };

//   try {
//     return await transporter.sendMail(mailOptions);
//   } catch (err) {
//     console.error("Nodemailer sendMail error:", {
//       message: err?.message,
//       code: err?.code,
//       command: err?.command,
//       response: err?.response,
//       responseCode: err?.responseCode,
//     });
//     throw err;
//   }
// }

// // ✅ Export par défaut (CommonJS)
// module.exports = sendConfirmationEmail;


// notif_service/src/mail/sendConfirmationEmail.js
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || "";

console.log("[MAIL] mode=OAuth2");
console.log("[MAIL] user =", EMAIL_USER);
console.log("[MAIL] has creds =", Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GMAIL_REFRESH_TOKEN));

const oAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

async function sendConfirmationEmail(toEmail, confirmationLink) {
  // Récupère un access token à la volée
  const { token: accessToken } = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL_USER,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: GMAIL_REFRESH_TOKEN,
      accessToken,
    },
    // (DEV seulement si proxy/antivirus casse TLS)
    // tls: { rejectUnauthorized: false },
  });

  return transporter.sendMail({
    from: `"RepAIr" <${EMAIL_USER}>`,
    to: toEmail,
    subject: "Confirmez votre adresse email",
    html: `
      <h2>Bienvenue sur RepAIr !</h2>
      <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email :</p>
      <a href="${confirmationLink}">Confirmer mon email</a>
    `,
  });
}

module.exports = sendConfirmationEmail;
