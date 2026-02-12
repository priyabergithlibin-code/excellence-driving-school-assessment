const router = require("express").Router();
const {
  getConfig,
  updateConfig,
  resetConfig,
} = require("../controllers/configController");

router.get("/", getConfig);
router.put("/", updateConfig);
router.post("/reset", resetConfig);

module.exports = router;
