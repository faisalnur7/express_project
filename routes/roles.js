const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getRoles, updateRole } = require("../controller/roles");
const router = express.Router();

router.post("/update-role", protect, updateRole);
router.get("/", getRoles);

module.exports = router;