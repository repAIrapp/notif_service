require("dotenv").config();
const express = require("express");
const emailRoutes = require("./src/routes/email");
const client = require("prom-client");
const helmet = require("helmet");

const app = express();
app.use(express.json());

// Prometheus
const register = new client.Registry();
const notifRequestsCounter = new client.Counter({
  name: "notif_requests_total",
  help: "Nombre total de requêtes sur le service notif",
  labelNames: ["method", "route", "status"],
});
register.registerMetric(notifRequestsCounter);
client.collectDefaultMetrics({ register });

app.use(helmet());
app.use((req, res, next) => {
  res.on("finish", () => {
    notifRequestsCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

// Health
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/email", emailRoutes);

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

module.exports = { app, register };
