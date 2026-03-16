const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { QueryListing } = require("../utils/queryListing");

// @doc get all Categories
// @route Get /api/User
// @access private
exports.getAllUser = asyncHandler(async (req, res) => {
  // apply pagination and filteration //
  const allUsers = await QueryListing(User, req.query);
  if (allUsers.length === 0) {
    res.status(404).json({
      success: false,
      message: "no users exists",
      data: null,
    });
  } else {
    res.status(200).json({
      success: true,
      message: "got users successfully!",
      data: { page: req.query.pageNumber, length: allUsers.length, allUsers },
    });
  }
});

// @doc get specific User by ID
// @route Get /api/User/:userID
// @access private
exports.getSpecificUser = asyncHandler(async (req, res, next) => {
  let specificUser = await User.findById(req.params.userID);
  if (!specificUser) {
    return next(new ApiError(`User ID ${req.params.userID} not exists`, 404));
  }
  res.status(200).json({ success: true, User: specificUser });
});

// @doc pann specific User by ID from admin
// @route patch /api/User/:userID
// @access private
exports.pannSpecificUser = asyncHandler(async (req, res, next) => {
  body = { panned: true };
  let deletedUser = await User.findByIdAndUpdate(req.params.userID, body, {
    new: true,
  });
  if (!deletedUser) {
    return next(new ApiError(`User ID ${req.params.userID} not exists`, 404));
  }
  res.status(202).json({
    success: true,
    message: `user panned successfully!`,
  });
});

// @doc delete specific User by ID from admin
// @route delete /api/User/:userID
// @access private
exports.deleteSpecificUser = asyncHandler(async (req, res, next) => {
  let deletedUser = await User.findByIdAndDelete(req.params.userID);
  if (!deletedUser) {
    return next(new ApiError(`User ID ${req.params.userID} not exists`, 404));
  }
  res.status(202).json({
    success: true,
    message: `user deleted successfully!`,
  });
});
