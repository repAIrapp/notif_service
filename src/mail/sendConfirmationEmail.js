
// const nodemailer = require("nodemailer");

// const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
// const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";
// const NODE_ENV = process.env.NODE_ENV || "development";

// if (NODE_ENV !== "test") {
//   console.log("[MAIL] mode=SMTP via Gmail (app password)");
//   console.log("[MAIL] user =", EMAIL_USER || "(vide)");
//   console.log("[MAIL] has creds =", Boolean(EMAIL_USER && GMAIL_APP_PASSWORD));
// }

// async function sendConfirmationEmail(toEmail, confirmationLink) {
//   if (!EMAIL_USER || !GMAIL_APP_PASSWORD) {
//     const err = new Error("[MAIL] EMAIL_USER ou GMAIL_APP_PASSWORD manquant");
//     console.error(err.message);
//     throw err;
//   }

//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//    // port: 465,
//     port: 587,
//     secure: true, // TLS
//     auth: { user: EMAIL_USER, pass: GMAIL_APP_PASSWORD },
//   });

//   try {
//     const info = await transporter.sendMail({
//       from: `"RepAIr" <${EMAIL_USER}>`,
//       to: toEmail,
//       subject: "Confirmez votre adresse email",
//       html: `
//         <h2>Bienvenue sur RepAIr !</h2>
//         <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email :</p>
//         <a href="${confirmationLink}">Confirmer mon email</a>
//       `,
//     });

//     if (NODE_ENV !== "test") {
//       console.log("[MAIL] Message envoyé:", info?.messageId || "(id inconnu)");
//     }
//     return info;
//   } catch (e) {
//     console.error("[MAIL] sendMail error:", {
//       message: e?.message,
//       code: e?.code,
//       command: e?.command,
//       stack: e?.stack,
//     });
//     throw e;
//   }
// }

// module.exports = sendConfirmationEmail;




// src/mail/sendConfirmationEmail.js
const nodemailer = require("nodemailer");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV !== "test") {
  console.log("[MAIL] mode=SMTP via Gmail (app password)");
  console.log("[MAIL] user =", EMAIL_USER || "(vide)");
  console.log("[MAIL] has creds =", Boolean(EMAIL_USER && GMAIL_APP_PASSWORD));
}

function createTransport(useStartTLS587 = true) {
  if (useStartTLS587) {
    // STARTTLS (port 587) — recommandé sur Render
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,              // IMPORTANT: false sur 587
      auth: { user: EMAIL_USER, pass: GMAIL_APP_PASSWORD },
      requireTLS: true,           // oblige l’upgrade STARTTLS
      tls: {
        minVersion: "TLSv1.2",    // évite les négociations bizarres
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  // TLS direct (port 465)
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,                 // IMPORTANT: true sur 465
    auth: { user: EMAIL_USER, pass: GMAIL_APP_PASSWORD },
    tls: {
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

async function verifyTransport(transporter, label) {
  try {
    await transporter.verify();
    console.log(`[MAIL] verify OK (${label}) for ${EMAIL_USER}`);
    return true;
  } catch (e) {
    console.error(`[MAIL] verify FAILED (${label}):`, e?.message || e);
    return false;
  }
}

async function sendConfirmationEmail(toEmail, confirmationLink) {
  if (!EMAIL_USER || !GMAIL_APP_PASSWORD) {
    const err = new Error("[MAIL] EMAIL_USER ou GMAIL_APP_PASSWORD manquant");
    console.error(err.message);
    throw err;
  }

  // 1er essai: 587 / STARTTLS
  let transporter = createTransport(true);
  let ok = await verifyTransport(transporter, "587/STARTTLS");

  if (!ok) {
    // Fallback: 465 / TLS direct
    transporter = createTransport(false);
    ok = await verifyTransport(transporter, "465/TLS");
    if (!ok) {
      throw new Error("Impossible d’établir la connexion SMTP (587/465 échouent).");
    }
  }

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
      console.log("[MAIL] send OK:", info?.messageId || info);
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
