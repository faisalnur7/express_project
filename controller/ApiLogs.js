const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ApiLogsService = require("../models/ApiLogs");

// exports.getLogs = asyncHandler(async (req, res, next) => {
//   try {
//     const getLogs = await ApiLogsService.find({})
//       .sort({ timestamp: -1 }) // Sort by timestamp in descending order
//       .limit(100); // Limit the result to the latest 30 logs

//     if (!getLogs || getLogs.length === 0) {
//       return next(new ErrorResponse("No logs found!", 404));
//     }

//     return res.status(200).json({
//       success: true,
//       msg: "Logs fetched successfully!",
//       data: getLogs,
//     });
//   } catch (error) {
//     return next(new ErrorResponse("Failed to fetch logs!", 500));
//   }
// });
exports.getLogs = asyncHandler(async (req, res, next) => {
  try {
    // Extract method from query parameters
    const { method, type } = req.query;

    // Build the query object dynamically
    const query = {};

    if (method) {
      query.method = method.toUpperCase();
    }

    if (type === "Success") {
      query["responseBody.success"] = true;
    } else if (type === "Failed") {
      query["responseBody.success"] = false;
    }

    const getLogs = await ApiLogsService.find(query)
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .limit(300); // Limit the result to the latest 100 logs

    // if (!getLogs || getLogs.length === 0) {
    //   return next(new ErrorResponse("No logs found!", 404));
    // }

    return res.status(200).json({
      success: true,
      msg: "Logs fetched successfully!",
      data: getLogs,
    });
  } catch (error) {
    return next(new ErrorResponse("Failed to fetch logs!", 500));
  }
});

exports.clearLogs = asyncHandler(async (req, res, next) => {
  try {
    const result = await ApiLogsService.deleteMany({}); // Deletes all documents in the collection

    if (result.deletedCount === 0) {
      return next(new ErrorResponse("No logs to delete!", 404));
    }

    return res.status(200).json({
      success: true,
      msg: "All logs cleared successfully!",
      data: {
        deletedCount: result.deletedCount, // Number of deleted documents
      },
    });
  } catch (error) {
    return next(new ErrorResponse("Failed to clear logs!", 500));
  }
});
