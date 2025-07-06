const express = require("express");
const router = express.Router();
const sendConfirmationEmail = require("../mail/sendConfirmationEmail");

// POST /api/email/confirmation
router.post("/confirmation", async (req, res) => {
  const { email, confirmationLink } = req.body;

  if (!email || !confirmationLink) {
    return res.status(400).json({ error: "Email et lien requis." });
  }

  try {
    await sendConfirmationEmail(email, confirmationLink);
    res.json({ message: "Email de confirmation envoyé." });
  } catch (err) {
    console.error("Erreur envoi email:", err);
    res.status(500).json({ error: "Échec de l’envoi de l’email." });
  }
});

module.exports = router;
