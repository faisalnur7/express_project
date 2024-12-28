const multer = require("multer");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const path = require("path");
//@desc     create user
//@route    POST    /api/users
//@access   private
exports.createUser = asyncHandler(async (req, res, next) => {
  const isExist = await User.findOne({ email: req.body.email });
  if (isExist) {
    return next(new ErrorResponse("User Already Exist", 400));
  }
  const user = await User.create(req.body);
  if (user) {
    return res.status(201).json({
      success: true,
      data: user,
      token: user.getSignedJwtToken(),
    });
  } else {
    return next(new ErrorResponse("Invalid Data", 400));
  }
});

//@desc     get profile
//@route    GET     /api/users/profile
//@access   private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  return res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     get auth user
//@route    POST     /api/users/login
//@access   public
exports.authUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (user && (await user.matchPassword(req.body.password.toString()))) {
    return res.status(200).json({
      success: true,
      data: user,
      token: user.getSignedJwtToken(),
    });
  } else {
    return next(new ErrorResponse(`Invalid email or password`, 401));
  }
});

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  if (!users) {
    return next(new ErrorResponse("No Users Found!", 404));
  }
  return res.status(200).json({
    success: true,
    msg: "Users fetched successfully!",
    data: users.reverse(),
  });
});
// by Banna
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;

  // Build query dynamically based on provided filters
  const query = {};
  if (email) query.email = email; // Exact match for email
  if (password) query.password = password; // Exact match for password

  const users = await User.find(query);
  if (!users || users.length === 0) {
    return next(new ErrorResponse("No Users Found!", 404));
  }

  return res.status(200).json({
    success: true,
    msg: "Users fetched successfully!",
    data: users,
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
// Create user API
exports.createNewUser = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const isExist = await User.findOne({ email: req.body.email });
  if (isExist) {
    return next(new ErrorResponse("User Already Exist", 400));
  }
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }

    // if (!req.file && !req.body.id) {
    //   return next(
    //     new ErrorResponse("Please upload a file or provide an ID", 400)
    //   );
    // }

    const { name, email, password, role } = req.body;

    try {
      // Create a new document
      // if (!req.file) {
      //   return next(new ErrorResponse("Please upload a file", 400));
      // }

      doc = await User.create({
        name,
        email,
        password,
        role,
        imagePath: req.file?.path || '',
      });

      return res.status(201).json({
        success: true,
        msg: "Document uploaded successfully!",
        data: doc,
      });
    } catch (error) {
      return next(new ErrorResponse(error.message, 500));
    }
  });
});

// DELETE Document by ID
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.body;
  
    // Validate if id is provided
    if (!id) {
      return next(new ErrorResponse("Document ID is required", 400));
    }
  
    // Find and delete the document by ID
    const deletedDoc = await User.findByIdAndDelete(id);
  
    if (!deletedDoc) {
      return next(new ErrorResponse(`No document found with ID: ${id}`, 404));
    }
  
    return res.status(200).json({
      success: true,
      msg: "Document deleted successfully!",
      data: deletedDoc,
    });
  });
