const router = require("express").Router();
const { getClassReports } = require("../controllers/reportsController");

router.get("/class-reports", getClassReports);

module.exports = router;
