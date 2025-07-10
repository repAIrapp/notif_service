require("dotenv").config();
const express = require("express");
const emailRoutes = require("./src/routes/email");

const app = express();
const PORT = process.env.PORT || 3005;
const client = require("prom-client");

app.use(express.json());
const register = new client.Registry();

const notifRequestsCounter = new client.Counter({
  name: "notif_requests_total",
  help: "Nombre total de requêtes sur le service notif",
  labelNames: ["method", "route", "status"]
});

register.registerMetric(notifRequestsCounter);

client.collectDefaultMetrics({ register });

app.use((req, res, next) => {
  res.on("finish", () => {
    notifRequestsCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});
app.use("/api/email", emailRoutes);
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
const metricsApp = express();
metricsApp.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});
metricsApp.listen(9105, () => {
  console.log("notif service metrics exposed on http://localhost:9105/metrics");
});