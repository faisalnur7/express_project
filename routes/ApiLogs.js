const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getLogs, clearLogs } = require("../controller/ApiLogs");
const router = express.Router();

router.get("/", protect, getLogs);
router.get("/clear", protect, clearLogs);

module.exports = router;
