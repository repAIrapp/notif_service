require("dotenv").config();
const express = require("express");
const emailRoutes = require("./src/routes/email");

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use("/api/email", emailRoutes);

app.listen(PORT, () => {
  console.log(`📨 Notification service running on port ${PORT}`);
});
