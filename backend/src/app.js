const express = require("express");
const cors = require("cors");

const { env } = require("./config/env");
const { errorHandler } = require("./middleware/errorHandler");

const healthRoutes = require("./routes/health");
const masterRoutes = require("./routes/master");
const registrationRoutes = require("./routes/registrations");
const jobRoutes = require("./routes/jobs");
const metricsRoutes = require("./routes/metrics");
const reportsRoutes = require("./routes/reports");
const configRoutes = require("./routes/configRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/config", configRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Elite Driving School API is running",
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

// error handler
app.use(errorHandler);

module.exports = { app };
