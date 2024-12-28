const express = require("express");
const { createUser, authUser, createNewUser, getAllUsers, deleteUser, getUserProfile } = require("../controller/users");
const router = express.Router();

// router.route("/").post(createUser);
router.route("/login").post(authUser);

// Route to POST/upload a user
router.post("/create-user", createNewUser);
router.post("/get-user-profile", getUserProfile);
router.get("/", getAllUsers);
// DELETE a document by ID
router.delete('/delete', deleteUser);

module.exports = router;
