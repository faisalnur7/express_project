const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getRoles, updateRole, createRole } = require("../controller/roles");
const router = express.Router();

router.post("/update-role", protect, updateRole);
router.post("/create-role", protect, createRole);
router.get("/", getRoles);

module.exports = router;