const router = require("express").Router();
const { seedMaster, listMaster } = require("../controllers/masterController");

router.post("/seed", seedMaster);
router.get("/list", listMaster);

module.exports = router;
