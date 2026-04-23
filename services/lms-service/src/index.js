const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./models");
const courseRoutes = require("./routes/courses");
const enrollmentRoutes = require("./routes/enrollments");
const uploadRoutes = require("./routes/uploads");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(morgan("combined"));
app.use(express.json());

app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.get("/health", (req, res) => res.json({ status: "ok", service: "lms-service" }));

const connectWithRetry = async () => {
  const maxRetries = 10;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("Database connected successfully");
      await sequelize.sync({ alter: true });
      app.listen(PORT, () => console.log("LMS Service running on port " + PORT));
      return;
    } catch (err) {
      retries++;
      console.log("DB connection failed, retrying in 3s... (" + retries + "/" + maxRetries + ")");
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  console.error("Could not connect to database after " + maxRetries + " retries");
  process.exit(1);
};

connectWithRetry();
