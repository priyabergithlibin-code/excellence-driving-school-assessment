const router = require("express").Router();
const {
  getScheduledClassesPerDay,
} = require("../controllers/metricsController");

router.get("/scheduled-classes-per-day", getScheduledClassesPerDay);

module.exports = router;
