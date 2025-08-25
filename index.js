const { app, register } = require("./app");
const express = require("express");

const PORT = process.env.PORT || 3005;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
  });

  // serveur métriques dédié (optionnel)
  const metricsApp = express();
  metricsApp.get("/metrics", async (_req, res) => {
    res.setHeader("Content-Type", register.contentType);
    res.send(await register.metrics());
  });
  metricsApp.listen(9105, () => {
    console.log("notif service metrics exposed on http://localhost:9105/metrics");
  });
}
