const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs = require("fs");
const libre = require("libreoffice-convert");
// const Template = require("../models/Template");
const path = require("path");
const officegen = require("officegen");
const docx = require("docx");
const mammoth = require("mammoth");
const Doc = require("../models/Doc");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendMail");
const multer = require("multer");


// by Banna

exports.getAllDocs = asyncHandler(async (req, res, next) => {
  const { search } = req.query;

  // Build the query object dynamically
  const query = {};

  if (search) {
    // Use a regular expression for substring matching (case insensitive)
    query.name = { $regex: search, $options: "i" };
  }
  const docs = await Doc.find(query);
  if (!docs) {
    return next(new ErrorResponse("No Documents Found!", 404));
  }
  return res.status(200).json({
    success: true,
    msg: "Documents fetched successfully!",
    data: docs,
  });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save to 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File Filter (optional, to accept only specific file types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|txt|jpg|jpeg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (extname) {
    cb(null, true);
  } else {
    cb(new ErrorResponse("Only documents and images are allowed!", 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
// POST Route to Upload or Update Document
exports.uploadDoc = asyncHandler(async (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }

    if (!req.file && !req.body.id) {
      return next(
        new ErrorResponse("Please upload a file or provide an ID", 400)
      );
    }

    const { id, name, description } = req.body;

    try {
      let doc;

      if (id) {
        // Find and update the document
        doc = await Doc.findById(id);
        if (!doc) {
          return next(new ErrorResponse("Document not found", 404));
        }

        // Update fields only if new values are provided
        doc.name = name || doc.name;
        doc.description = description || doc.description;
        if (req.file) {
          doc.file_path = req.file.path;
        }

        await doc.save();

        return res.status(200).json({
          success: true,
          msg: "Document updated successfully!",
          data: doc,
        });
      } else {
        // Create a new document
        if (!req.file) {
          return next(new ErrorResponse("Please upload a file", 400));
        }

        doc = await Doc.create({
          name,
          description,
          file_path: req.file.path,
        });

        return res.status(201).json({
          success: true,
          msg: "Document uploaded successfully!",
          data: doc,
        });
      }
    } catch (error) {
      return next(new ErrorResponse(error.message, 500));
    }
  });
});

// DELETE Document by ID
exports.deleteDoc = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  // Validate if id is provided
  if (!id) {
    return next(new ErrorResponse("Document ID is required", 400));
  }

  // Find and delete the document by ID
  const deletedDoc = await Doc.findByIdAndDelete(id);

  if (!deletedDoc) {
    return next(new ErrorResponse(`No document found with ID: ${id}`, 404));
  }

  return res.status(200).json({
    success: true,
    msg: "Document deleted successfully!",
    data: deletedDoc,
  });
});
