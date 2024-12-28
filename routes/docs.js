const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  extractDataFromTemplate,
  uploadTemplates,
  getAllTemplates,
  getSingleTemplate,
  getAllSavedFiles,
  sendSingleTemplate,
  getAllDocs,
  uploadDoc,
  deleteDoc,
} = require("../controller/docs");
// const multer = require("multer");
const router = express.Router();
// const fs = require("fs");
// const path = require("path");
// // Define the storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let folder = "uploads";
//     if (file.fieldname === "template") {
//       folder = path.join(folder, "docs");
//     } else if (file.fieldname === "image") {
//       folder = path.join(folder, "images");
//     } else if (file.fieldname === "template_file") {
//       folder = path.join(folder, "templates");
//     }

//     // Ensure the folder exists
//     fs.mkdirSync(folder, { recursive: true });
//     cb(null, folder);
//   },
//   filename: (req, file, cb) => {
//     if (file.fieldname === "template_file") {
//       cb(null, `${new Date().getTime()}-${file.originalname}`);
//     } else {
//       cb(null, `${file.originalname}`);
//     }
//   },
// });

// const upload = multer({ storage });

// router
//   .route("/upload-template")
//   .post(
//     protect,
//     authorize("admin"),
//     upload.fields([{ name: "template_file", maxCount: 1 }]),
//     uploadTemplates
//   );

// router.route("/extract-data-from-template").post(
//   protect,
//   upload.fields([
//     { name: "template", maxCount: 1 },
//     { name: "image", maxCount: 1 },
//   ]),
//   extractDataFromTemplate
// );

// router.route("/saved-files").get(getAllSavedFiles);
// router.route("/templates").get(getAllTemplates);
// router.route("/templates/:id").get(getSingleTemplate);
// router
//   .route("/templates/:id/send-email")
//   .get(protect, authorize("admin"), sendSingleTemplate);

router.route("/").get(getAllDocs);
// Route to POST/upload a new document
router.post("/upload", uploadDoc);
// DELETE a document by ID
router.delete('/delete', deleteDoc);

module.exports = router;
