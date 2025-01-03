const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const roles = require("../models/roles");

exports.getRoles = asyncHandler(async (req, res, next) => {
  const Roles = await roles.find({}).sort({ timestamp: -1 });
  if (!Roles) {
    return next(new ErrorResponse("No Roles Found!", 404));
  }
  return res.status(200).json({
    success: true,
    msg: "Roles fetched successfully!",
    data: Roles,
  });
});
exports.updateRole = asyncHandler(async (req, res, next) => {
  
});

