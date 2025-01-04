const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const roleController = require("../controller/roleController");
const router = express.Router();

router.post("/:roleId/update", protect, roleController.updateRole);
router.post("/create", protect, roleController.createRole);
router.delete("/delete", protect, roleController.deleteRole);
router.get("/", roleController.getRoles);

// MS active directory roles operations route
router.post("/get_azure_roles", protect, roleController.getAllAzureRoles);
router.post("/sync_azure_roles", protect, roleController.syncAllAzureRoles);
router.put("/:roleId/delete_role", protect, roleController.deactivateRoleById);
router.put("/:roleId/undo_delete_role", protect, roleController.reactivateRoleById);

module.exports = router;