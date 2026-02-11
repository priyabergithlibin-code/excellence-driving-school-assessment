const router = require("express").Router();

router.get("/:jobId", (req, res) => {
  res.json({ ok: true, jobId: req.params.jobId, status: "not_implemented" });
});

module.exports = router;
