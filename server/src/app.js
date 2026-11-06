require("dotenv").config();
require("./config/env");
const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/student.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

module.exports = app;
