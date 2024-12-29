const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { 
    createUser, 
    authUser, 
    createNewUser, 
    getAllUsers, 
    deleteUser, 
    getUserProfile, 
    createAdmin, 
    updateAdminPassword, 
    getAllAzureUsers, 
    getAllAzureRoles, 
    getUserAzureRoles, 
    syncAllAzureUsers,
    getAllMsadUsers,
    updateUser,
    deleteUserById,
    hardDeleteUser,
    undoDeleteUserById
} = require("../controller/users");
const router = express.Router();

router.post('/create-admin', createAdmin);

// router.route("/").post(createUser);
router.route("/login").post(authUser);
router.put("/update-admin-password", updateAdminPassword);

// Route to POST/upload a user
router.post("/create-user", protect, createNewUser);
router.post("/get-user-profile", protect, getUserProfile);
router.get("/", protect, getAllUsers);
// DELETE a document by ID
router.delete('/delete', protect, deleteUser);

// MS active directory user operations route
router.get("/azure_users", protect, getAllAzureUsers);
router.get("/azure_roles", protect, getAllAzureRoles);
router.get("/azure_user/:userId/roles", protect, getUserAzureRoles);
router.post("/sync_azure_users", protect, syncAllAzureUsers);

// get all microsoft active directory users from users collection
router.get("/get_all_msad_users", protect, getAllMsadUsers);

// update user by id
router.put("/:userId/update", protect, updateUser);

// delete user by id (soft delete)
router.put("/:userId/delete", protect, deleteUserById);

// undo delete user by id (soft delete)
router.put("/:userId/undo_delete", protect, undoDeleteUserById);

// delete user by id (hard delete)
router.delete("/:userId/hard_delete", protect, hardDeleteUser);

module.exports = router;
