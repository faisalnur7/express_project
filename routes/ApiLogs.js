const express = require("express");
const { getLogs, clearLogs } = require("../controller/ApiLogs");
const router = express.Router();

router.get("/", getLogs);
router.get("/clear", clearLogs);

module.exports = router;
