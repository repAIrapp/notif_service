const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendConfirmationEmail(toEmail, confirmationLink) {
  const mailOptions = {
    from: `"RepAIr" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Confirmez votre adresse email",
    html: `
      <h2>Bienvenue sur RepAIr !</h2>
      <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
      <a href="${confirmationLink}">Confirmer mon email</a>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendConfirmationEmail;
