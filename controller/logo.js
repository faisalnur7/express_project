const multer = require("multer");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const path = require("path");
const logo = require("../models/logo");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images"); // Save to 'uploads' folder
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
exports.getLogo = asyncHandler(async (req, res, next) => {
  const logos = await logo.find({});
  if (!logos) {
    return next(new ErrorResponse("No logos Found!", 404));
  }
  return res.status(200).json({
    success: true,
    msg: "logo fetched successfully!",
    data: logos.reverse(),
  });
});
// POST Route to Upload or Update Document
// exports.updateLogo = asyncHandler(async (req, res, next) => {
//   upload.single("file")(req, res, async (err) => {
//     if (err) {
//       return next(new ErrorResponse(err.message, 400));
//     }
//     try {
//       let doc;

//       if (!req.file) {
//         return next(new ErrorResponse("Please upload a file", 400));
//       }
//       doc = await logo.create({
//         file_path: req.file.path,
//       });

//       return res.status(201).json({
//         success: true,
//         msg: "Document uploaded successfully!",
//         data: doc,
//       });
//     } catch (error) {
//       return next(new ErrorResponse(error.message, 500));
//     }
//   });
// });
// POST Route to Upload or Update Document
exports.updateLogo = asyncHandler(async (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }
    
    if (!req.file) {
      return next(new ErrorResponse("Please upload a file", 400));
    }

    try {
      // Find the existing logo object (assuming only one object exists in the table)
      let doc = await logo.findOne();

      if (doc) {
        // Update the existing logo's file path
        doc.file_path = req.file.path;
        await doc.save();
      } else {
        // If no logo exists, create a new one
        doc = await logo.create({
          file_path: req.file.path,
        });
      }

      return res.status(200).json({
        success: true,
        msg: "Document updated successfully!",
        data: doc,
      });
    } catch (error) {
      return next(new ErrorResponse(error.message, 500));
    }
  });
});

