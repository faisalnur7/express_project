const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const ApiLogController = require("../controller/ApiLogController");
const router = express.Router();

router.get("/", protect, ApiLogController.getLogs);
router.get("/clear", protect, ApiLogController.clearLogs);

module.exports = router;
