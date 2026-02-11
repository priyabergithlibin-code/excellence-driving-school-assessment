const router = require("express").Router();
const { upload } = require("../middleware/multerUpload");
const { uploadCsv } = require("../controllers/registrationController");

router.post("/upload", upload.single("file"), uploadCsv);

module.exports = router;
