const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const categoryServices = require("../services/category.service");

// @doc create new Category
// @route Post /api/category
// @access private
exports.createCategory = asyncHandler(async (req, res, next) => {
  try {
    const newCategory = await categoryServices.createCategory(req.body.title);
    res.status(201).json({
      success: true,
      message: "created successfully!",
      category: newCategory,
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
  // apply pagination and filteration
  const allCategories = await categoryServices.listCategories(req.query);
  if (!allCategories) {
    res.status(404).json({
      success: false,
      message: "no categories found",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "categories found",
    data: {
      length: allCategories.length,
      page: req.query.pageNumber,
      categories: allCategories,
    },
  });
});

// @doc get specific category by ID
// @route Get /api/category/:categoryID
// @access public
exports.getSpecificCategory = asyncHandler(async (req, res, next) => {
  let specificCategory = await categoryServices.getCategoryById(
    req.params.categoryID,
  );
  if (!specificCategory) {
    return next(
      new ApiError(`category ID ${req.params.categoryID} not exists`, 404),
    );
  }
  res.status(200).json({ success: true, category: specificCategory });
});

// @doc update specific category by ID
// @route put /api/category/:categoryID
// @access private
exports.updateSpecificCategory = asyncHandler(async (req, res, next) => {
  let specificCategory = await categoryServices.updateCategoryById(
    req.params.categoryID,
    req.body,
  );
  if (!specificCategory) {
    return next(
      new ApiError(`category ID ${req.params.categoryID} not exists`, 404),
    );
  }
  res.status(202).json({ success: true, category: specificCategory });
});

// @doc delete specific category by ID
// @route delete /api/category/:categoryID
// @access private
exports.deleteSpecificCategory = asyncHandler(async (req, res, next) => {
  let deletedCategory = await categoryServices.deleteCategoryById(
    req.params.categoryID,
  );
  if (!deletedCategory) {
    return next(
      new ApiError(`category ID ${req.params.categoryID} not exists`, 404),
    );
  }
  res.status(202).json({ success: true, message: "deleted successfully!" });
});

// @doc delete specific category by ID
// @route delete /api/category/:categoryID
// @access private
exports.deleteAllCategory = asyncHandler(async (req, res, next) => {
  let deletedCategory = await categoryServices.deleteAllCategorys();
  if (!deletedCategory) {
    return next(new ApiError(`there is no categories`, 404));
  }
  res.status(202).json({ success: true, message: "deleted successfully!" });
});
