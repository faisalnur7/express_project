const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const MsadController = require("../controller/MsadController");
const router = express.Router();

router.post("/", protect, MsadController.updateMS_AD_settings);
router.get("/", protect, MsadController.getMS_AD_settings);

module.exports = router;