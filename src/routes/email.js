const express = require("express");
const router = express.Router();
const sendConfirmationEmail = require("../mail/sendConfirmationEmail");
const { body, validationResult } = require("express-validator");
const rateLimit = require('express-rate-limit');

// router.post("/confirmation", async (req, res) => {
//   const { email, confirmationLink } = req.body;

//   if (!email || !confirmationLink) {
//     return res.status(400).json({ error: "Email et lien requis." });
//   }

//   try {
//     await sendConfirmationEmail(email, confirmationLink);
//     res.json({ message: "Email de confirmation envoyé." });
//   } catch (err) {
//     console.error("Erreur envoi email:", err);
//     res.status(500).json({ error: "Échec de l’envoi de l’email." });
//   }
// });
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { error: "Trop de tentatives, réessayez plus tard." },
});

router.post(
  "/confirmation",
  emailLimiter,
  [
    body("email").isEmail(),
    // body("confirmationLink").isURL(),
     body("confirmationLink").isURL({
    require_protocol: true,
    require_host: true,
    require_tld: false,           
    protocols: ["http", "https"],
   }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, confirmationLink } = req.body;

    try {
      await sendConfirmationEmail(email, confirmationLink);
      res.json({ message: "Email de confirmation envoyé." });
    // } catch (err) {
    //   console.error("Erreur envoi email:", err);
    //   res.status(500).json({ error: "Échec de l’envoi de l’email." });
    // }
    } catch (err) {
  console.error("Erreur envoi email:", {
    message: err?.message,
    code: err?.code,
    response: err?.response,
    responseCode: err?.responseCode
  });
  return res.status(500).json({
    error: "Échec de l’envoi de l’email.",
    details: process.env.NODE_ENV !== "production" ? {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      responseCode: err?.responseCode
    } : undefined
  });
}

  }
);

module.exports = router;
