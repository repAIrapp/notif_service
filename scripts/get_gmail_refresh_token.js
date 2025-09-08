// scripts/get_gmail_refresh_token.js
const http = require("http");
const { google } = require("googleapis");
const { exec } = require("child_process");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Loopback pour client "Ordinateur de bureau"
const PORT = 53682; // change le port si déjà utilisé
const REDIRECT_URI = `http://127.0.0.1:${PORT}`;
// const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const SCOPES = ["https://mail.google.com/"]; // <-- au lieu de gmail.send


if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("⚠️  GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET manquant(s).");
  process.exit(1);
}

const oauth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Ouvre l'URL dans le navigateur (sans package externe)
function openBrowser(url) {
  if (process.platform === "win32") {
    exec(`start "" "${url}"`);
  } else if (process.platform === "darwin") {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

const authUrl = oauth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("Si le navigateur ne s'ouvre pas, copie-colle manuellement cette URL :\n", authUrl);
openBrowser(authUrl);

http
  .createServer(async (req, res) => {
    const u = new URL(req.url, REDIRECT_URI);
    const code = u.searchParams.get("code");
    if (!code) return res.end("No code");
    res.end("OK, tu peux fermer cette fenêtre.");
    try {
      const { tokens } = await oauth.getToken(code);
      console.log("\nREFRESH TOKEN:", tokens.refresh_token);
      process.exit(0);
    } catch (e) {
      console.error("Erreur lors de l'échange du code:", e?.message || e);
      process.exit(1);
    }
  })
  .listen(PORT, () => console.log(`Attente sur ${REDIRECT_URI}`));
