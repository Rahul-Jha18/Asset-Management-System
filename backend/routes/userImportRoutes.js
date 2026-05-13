const express = require("express");
const router = express.Router();
const { bulkImportUsers } = require("../controllers/userImportController");

router.post("/import", bulkImportUsers);

module.exports = router;