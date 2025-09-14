const express = require("express");
const router = express.Router();
const sendConfirmationEmail = require("../mail/sendConfirmationEmail");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");

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
    body("confirmationLink").isURL({
      require_protocol: true,
      require_host: true,
      require_tld: false, // permet localhost dans les tests
      protocols: ["http", "https"],
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, confirmationLink } = req.body;

    // try {
    //   await sendConfirmationEmail(email, confirmationLink);
    //   return res.json({ message: "Email de confirmation envoyé." });
    // } catch (err) {
    //   return res.status(500).json({ error: "Échec de l’envoi de l’email." });
    // }
      try {
    await sendConfirmationEmail(email, confirmationLink);
    return res.json({ message: "Email de confirmation envoyé." });
  } catch (err) {
    console.error("[MAIL][ROUTE] send failed:", {
      message: err?.message,
      code: err?.code,
      response: err?.response?.data,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: process.env.NODE_ENV === "production"
        ? "Échec de l’envoi de l’email."
        : `Échec: ${err?.message || "unknown"}`,
    });
  }
  }
);

module.exports = router;
