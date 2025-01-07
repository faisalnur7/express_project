const express = require("express");
const MsadController = require("../controller/MsadController");
const router = express.Router();

router.get("/", MsadController.getMS_AD_configuration);

module.exports = router;