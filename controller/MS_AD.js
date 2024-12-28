const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const microsoft_ad = require("../models/MS_AD");

exports.getMS_AD_settings = asyncHandler(async (req, res, next) => {
  const getMS_AD_settings = await microsoft_ad.find({});
  if (!getMS_AD_settings) {
    return next(new ErrorResponse("No getMS_AD_settings Found!", 404));
  }
  return res.status(200).json({
    success: true,
    msg: "MSADSettings fetched successfully!",
    data: getMS_AD_settings.reverse(),
  });
});

exports.updateMS_AD_settings = asyncHandler(async (req, res, next) => {
  try {
    const { id, ...updateData } = req.body; // Extract id and other fields from the request body

    let msADSettings = await microsoft_ad.findOne(); // Fetch the single existing object

    if (msADSettings) {
      // Update the existing document
      msADSettings = await microsoft_ad.findByIdAndUpdate(msADSettings._id, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
      });
    } else {
      // Create a new document if one does not exist or no data is provided
      msADSettings = await microsoft_ad.create(updateData && Object.keys(updateData).length > 0 ? updateData : {});
    }

    return res.status(200).json({
      success: true,
      msg: "MS AD settings updated successfully!",
      data: msADSettings,
    });
  } catch (error) {
    next(error); // Pass any errors to the error handler middleware
  }
});