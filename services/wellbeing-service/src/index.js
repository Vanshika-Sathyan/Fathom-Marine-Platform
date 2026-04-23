const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { sequelize } = require("./models");
const surveyRoutes = require("./routes/surveys");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1/surveys", surveyRoutes);
app.get("/health", (req, res) => res.json({ status: "ok", service: "wellbeing-service" }));

const connectWithRetry = async () => {
  const maxRetries = 10;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("Database connected successfully");
      await sequelize.sync({ alter: true });
      app.listen(PORT, () => console.log("Wellbeing Service running on port " + PORT));
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
