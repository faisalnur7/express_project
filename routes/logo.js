const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { updateLogo, getLogo } = require("../controller/logo");
const router = express.Router();

router.post("/update-logo", protect, updateLogo);
router.get("/", protect, getLogo);

module.exports = router;
