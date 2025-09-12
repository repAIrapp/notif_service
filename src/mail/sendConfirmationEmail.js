const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || "";

// Logs utiles en dev/prod, silencieux en test
if (process.env.NODE_ENV !== "test") {
  console.log("[MAIL] mode=OAuth2");
  console.log("[MAIL] user =", EMAIL_USER);
  console.log(
    "[MAIL] has creds =",
    Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GMAIL_REFRESH_TOKEN)
  );
}

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);
oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

async function sendConfirmationEmail(toEmail, confirmationLink) {
  // En test: pas d’OAuth, on laisse le mock nodemailer fonctionner
  if (process.env.NODE_ENV === "test") {
    const transporter = nodemailer.createTransport();
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

  // Prod/Dev : OAuth2 normal
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
    // tls: { rejectUnauthorized: false }, // si besoin en dev
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
