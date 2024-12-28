const express = require("express");
const { getMS_AD_settings, updateMS_AD_settings } = require("../controller/MS_AD");
const router = express.Router();

router.post("/", updateMS_AD_settings);
router.get("/", getMS_AD_settings);

module.exports = router;