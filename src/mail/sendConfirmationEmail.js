const nodemailer = require("nodemailer");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";
const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV !== "test") {
  console.log("[MAIL] mode=SMTP via Gmail (app password)");
  console.log("[MAIL] user =", EMAIL_USER || "(vide)");
  console.log("[MAIL] has creds =", Boolean(EMAIL_USER && GMAIL_APP_PASSWORD));
}

async function sendConfirmationEmail(toEmail, confirmationLink) {
  if (!EMAIL_USER || !GMAIL_APP_PASSWORD) {
    const err = new Error("[MAIL] EMAIL_USER ou GMAIL_APP_PASSWORD manquant");
    console.error(err.message);
    throw err;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // TLS
    auth: { user: EMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  try {
    const info = await transporter.sendMail({
      from: `"RepAIr" <${EMAIL_USER}>`,
      to: toEmail,
      subject: "Confirmez votre adresse email",
      html: `
        <h2>Bienvenue sur RepAIr !</h2>
        <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email :</p>
        <a href="${confirmationLink}">Confirmer mon email</a>
      `,
    });

    if (NODE_ENV !== "test") {
      console.log("[MAIL] Message envoyé:", info?.messageId || "(id inconnu)");
    }
    return info;
  } catch (e) {
    console.error("[MAIL] sendMail error:", {
      message: e?.message,
      code: e?.code,
      command: e?.command,
      stack: e?.stack,
    });
    throw e;
  }
}

module.exports = sendConfirmationEmail;
