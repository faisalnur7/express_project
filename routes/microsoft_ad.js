const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getMS_AD_settings, updateMS_AD_settings } = require("../controller/MS_AD");
const router = express.Router();

router.post("/", protect, updateMS_AD_settings);
router.get("/", protect, getMS_AD_settings);

module.exports = router;