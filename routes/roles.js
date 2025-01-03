const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { 
    getRoles,
    updateRole,
    createRole,
    deleteRole,
    syncAllAzureRoles,
    deactivateRoleById,
    reactivateRoleById
} = require("../controller/roles");
const router = express.Router();

router.post("/:roleId/update", protect, updateRole);
router.post("/create", protect, createRole);
router.delete("/delete", protect, deleteRole);
router.get("/", getRoles);

// MS active directory roles operations route
router.post("/sync_azure_roles", protect, syncAllAzureRoles);
router.put("/:roleId/delete_role", protect, deactivateRoleById);
router.put("/:roleId/undo_delete_role", protect, reactivateRoleById);

module.exports = router;