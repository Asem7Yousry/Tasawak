const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @doc create new Category
// @route Post /api/category
// @access private
exports.createCategory = asyncHandler(async (req, res, next) => {
  try {
    const newCategory = await Category.create({
      title: req.body.title,
    });
    res.status(201).json({
      success: true,
      category: newCategory,
      message: "created successfully!",
    });
  } catch (error) {
    if (error.code === 11000) {
      // duplicate title mongo error
      return next(new ApiError(`title:${req.body.title} already exists`, 400));
    }
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc get all Categories
// @route Get /api/category
// @access public
exports.getAllCategory = asyncHandler(async (req, res) => {
  // apply pagination
  let limit = req.query.limit || 10;
  let page = req.query.page || 1;
  let skip = (page - 1) * limit;
  let allCategories = await Category.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  res.status(200).json({
    success: true,
    length: allCategories.length,
    page,
    data: allCategories,
  });
});

// @doc get specific category by ID
// @route Get /api/category/:categoryID
// @access public
exports.getSpecificCategory = asyncHandler(async (req, res, next) => {
  let specificCategory = await Category.findById(req.params.categoryID);
  if (!specificCategory) {
    return next(
      new ApiError(`category ID ${req.params.categoryID} not exists`, 404)
    );
  }
  res.status(200).json({ success: true, category: specificCategory });
});

// @doc update specific category by ID
// @route put /api/category/:categoryID
// @access private
exports.updateSpecificCategory = asyncHandler(async (req, res, next) => {
  let specificCategory = await Category.findByIdAndUpdate(
    req.params.categoryID,
    req.body,
    { new: true }
  );
  if (!specificCategory) {
    return next(
      new ApiError(`category ID ${req.params.categoryID} not exists`, 404)
    );
  }
  res.status(202).json({ success: true, category: specificCategory });
});

// @doc delete specific category by ID
// @route delete /api/category/:categoryID
// @access private
exports.deleteSpecificCategory = asyncHandler(async (req, res, next) => {
  let deletedCategory = await Category.findByIdAndDelete(req.params.categoryID);
  if (!deletedCategory) {
    return next(
      new ApiError(`category ID ${req.params.categoryID} not exists`, 404)
    );
  }
  res.status(202).json({ success: true, message: "deleted successfully!" });
});
