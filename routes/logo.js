const express = require("express");
const { updateLogo, getLogo } = require("../controller/logo");
const router = express.Router();

router.post("/update-logo", updateLogo);
router.get("/", getLogo);

module.exports = router;
