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
exports.createRole = asyncHandler(async (req, res, next) => {
  const { title } = req.body;

  // Check if the title already exists in the collection (trimmed and case-insensitive)
  const isRoleAlreadyExist = await roles.findOne({
    title: { $regex: `^${title.trim()}$`, $options: "i" },
  });
  if (isRoleAlreadyExist) {
    return next(new ErrorResponse("Role with this title already exists", 400));
  }

  // Create a new role
  const newRole = await roles.create({ title: title.trim() });

  return res.status(201).json({
    success: true,
    msg: "Role created successfully!",
    data: newRole,
  });
});
exports.updateRole = asyncHandler(async (req, res, next) => {
  const { id, title } = req.body;

  // Find the role by id and update the title
  const updatedRole = await roles.findByIdAndUpdate(
    id,
    { title },
    { new: true, runValidators: true }
  );

  if (!updatedRole) {
    return next(new ErrorResponse("Role not found", 404));
  }

  return res.status(200).json({
    success: true,
    msg: "Role updated successfully!",
    data: updatedRole,
  });
});
exports.deleteRole = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  // Find the role by id and delete it
  const deletedRole = await roles.findByIdAndDelete(id);

  if (!deletedRole) {
    return next(new ErrorResponse("Role not found", 404));
  }

  return res.status(200).json({
    success: true,
    msg: "Role deleted successfully!",
    data: deletedRole,
  });
});
