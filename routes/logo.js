const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const logoController = require("../controller/logoController");
const router = express.Router();

router.post("/update-logo", protect, logoController.updateLogo);
router.get("/", logoController.getLogo);

module.exports = router;
