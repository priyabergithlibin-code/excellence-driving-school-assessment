const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ ok: true, message: "Healthy" });
});

module.exports = router;
