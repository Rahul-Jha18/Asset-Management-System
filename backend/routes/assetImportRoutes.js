const router = require("express").Router();
const { importAssets } = require("../controllers/assetImportController");
const { protect } = require("../middleware/authMiddleware");

router.post("/import", protect, importAssets);

module.exports = router;
