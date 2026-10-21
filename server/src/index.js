require("dotenv").config();
require("./config/env");
const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/student.routes");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");

const app = express();
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
