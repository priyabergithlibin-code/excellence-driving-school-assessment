const express = require("express");
const cors = require("cors");

const { env } = require("./config/env");
const { errorHandler } = require("./middleware/errorHandler");

const healthRoutes = require("./routes/health");
const masterRoutes = require("./routes/master");
const registrationRoutes = require("./routes/registrations");
const jobRoutes = require("./routes/jobs");

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/jobs", jobRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

// error handler
app.use(errorHandler);

module.exports = { app };
