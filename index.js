// const { app, register } = require("./app");
// const express = require("express");

// const PORT = process.env.PORT || 3005;

// if (process.env.NODE_ENV !== "production") {
//    require("dotenv").config();
//   app.listen(PORT, () => {
//     console.log(`Notification service running on port ${PORT}`);
//   });

//   // serveur métriques dédié (optionnel)
//   const metricsApp = express();
//   metricsApp.get("/metrics", async (_req, res) => {
//     res.setHeader("Content-Type", register.contentType);
//     res.send(await register.metrics());
//   });
//   metricsApp.listen(9105, () => {
//     console.log("notif service metrics exposed on http://localhost:9105/metrics");
//   });
// }


// index.js
const { app, register } = require("./app");
const express = require("express");

// charger .env uniquement en dev
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT || 3005;

// Exposer /metrics sur la même app (OK pour Render)
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

// Démarrage (en dev ET prod)
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
  console.log(`Metrics available at /metrics`);
});
