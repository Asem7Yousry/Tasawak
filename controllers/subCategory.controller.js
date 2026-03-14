const asyncHandler = require("express-async-handler");
const subCategory = require("../models/subCategoryModel");
const ApiError = require("../utils/apiError");
const subCategoryServ = require("../services/subcategory.service");

// @doc create new subCategory with parent category id (catgoryID)
// @route Post /api/subCategory
// @access private
exports.createSubCategory = asyncHandler(async (req, res, next) => {
  try {
    let subCategory = await subCategoryServ.createSubCategory(req);
    res
      .status(201)
      .json({ success: true, message: "created successfully!", subCategory });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(`title:${req.body.title} already exists`, 409));
    }
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc get all subCategories
// @route Get /api/subCategory
// @access public
exports.getAllSubCategory = asyncHandler(async (req, res) => {
  // apply pagination & filteration and sorting
  const query = req.query;
  if (req.params.categoryID) {
    query["categoryID"] = req.params.categoryID;
  }
  let allSubCategories = await subCategoryServ.listsubCategories(query);
  if (!allSubCategories) {
    res.status(404).json({
      success: false,
      data: null,
      message: "no subCategories found!",
    });
  }
  res.status(200).json({
    success: true,
    data: {
      length: allSubCategories.length,
      page: query.pageSize,
      allSubCategories,
    },
  });
});

// @doc get specific subCategory by ID
// @route Get /api/subCategory/:subCategoryID
// @access public
exports.getSpecificSubCategory = asyncHandler(async (req, res, next) => {
  let specificSubCategory = await subCategoryServ.getSubCategoryById(
    req.params.subCategoryID,
  );
  if (!specificSubCategory) {
    return next(
      new ApiError(
        `subCategory ID ${req.params.subCategoryID} not exists`,
        404,
      ),
    );
  }
  res.status(200).json({ success: true, subcategory: specificSubCategory });
});

// @doc update specific subCategory by ID
// @route put /api/subCategory/:subCategoryID
// @access private
exports.updateSpecificSubCategory = asyncHandler(async (req, res, next) => {
  let specificSubCategory = await subCategoryServ.updateSubCategoryById(
    req.params.subCategoryID,
    req.body,
    { new: true },
  );
  if (!specificSubCategory) {
    return next(
      new ApiError(
        `subCategory ID ${req.params.subCategoryID} not exists`,
        404,
      ),
    );
  }
  res.status(202).json({ success: true, subCategory: specificSubCategory });
});

// @doc delete specific subCategory by ID
// @route delete /api/subCategory/:subsubCategoryID
// @access private
exports.deleteSpecificSubCategory = asyncHandler(async (req, res, next) => {
  let deletedSubCategory = await subCategory.findByIdAndDelete(
    req.params.subCategoryID,
  );
  if (!deletedSubCategory) {
    return next(
      new ApiError(
        `subCategory ID ${req.params.subCategoryID} not exists`,
        404,
      ),
    );
  }
  res.status(202).json({ success: true, message: "deleted successfully!" });
});
