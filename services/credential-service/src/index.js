const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./models");
require("dotenv").config();
const credentialRoutes = require("./routes/credentials");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(morgan("combined"));
app.use(express.json());

app.use("/api/v1/credentials", credentialRoutes);
app.use("/api/v1/auth", authRoutes);
app.get("/health", (req, res) => res.json({ status: "ok", service: "credential-service" }));

const connectWithRetry = async () => {
  const maxRetries = 10;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("Database connected successfully");
      await sequelize.sync({ alter: true });
      app.listen(PORT, () => console.log("Credential Service running on port " + PORT));
      return;
    } catch (err) {
      retries++;
      console.log("DB connection failed, retrying in 3s... (" + retries + "/" + maxRetries + ")");
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  console.error("Could not connect to database");
  process.exit(1);
};

connectWithRetry();
module.exports = app;
