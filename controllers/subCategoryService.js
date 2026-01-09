const subCategory = require("../models/subCategoryModel");
const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const {filterPagination} = require("../utils/filterPaginationMethod")

// @doc create new subCategory with parent category id (catgoryID)
// @route Post /api/subCategory
// @access private
exports.createSubCategory = asyncHandler(async (req, res, next) => {
  try {
    // nested route
    let categoryID = req.params.categoryID || req.body.categoryID;
    let category = await Category.findById(categoryID);
    let newSubCategory = await subCategory.create({
      title: req.body.title,
      categoryID: categoryID,
      categoryName: category.title,
    });
    res.status(201).json({ success: true, subCategory: newSubCategory });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(`title:${req.body.title} already exists`, 400));
    }
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc get all subCategories
// @route Get /api/subCategory
// @access public
exports.getAllSubCategory = asyncHandler(async (req, res) => {
  // apply pagination & filteration and sorting
  [limit, page, skip, filter, sort, fields] = filterPagination(req.query);
  if(req.params.categoryID){
    filter['categoryID']= req.params.categoryID
  }  
  let allSubCategories = await subCategory
    .find(filter, fields)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  res.status(200).json({
    success: true,
    length: allSubCategories.length,
    page,
    data: allSubCategories,
  });
});

// @doc get specific subCategory by ID
// @route Get /api/subCategory/:subCategoryID
// @access public
exports.getSpecificSubCategory = asyncHandler(async (req, res, next) => {
  let specificSubCategory = await subCategory.findById(
    req.params.subCategoryID
  );
  if (!specificSubCategory) {
    return next(
      new ApiError(`subCategory ID ${req.params.subCategoryID} not exists`, 404)
    );
  }
  res.status(200).json({ success: true, subcategory: specificSubCategory });
});

// @doc update specific subCategory by ID
// @route put /api/subCategory/:subCategoryID
// @access private
exports.updateSpecificSubCategory = asyncHandler(async (req, res, next) => {
  let specificSubCategory = await subCategory.findByIdAndUpdate(
    req.params.subCategoryID,
    req.body,
    { new: true }
  );
  if (!specificSubCategory) {
    return next(
      new ApiError(`subCategory ID ${req.params.subCategoryID} not exists`, 404)
    );
  }
  res.status(202).json({ success: true, subCategory: specificSubCategory });
});

// @doc delete specific subCategory by ID
// @route delete /api/subCategory/:subsubCategoryID
// @access private
exports.deleteSpecificSubCategory = asyncHandler(async (req, res, next) => {
  let deletedSubCategory = await subCategory.findByIdAndDelete(
    req.params.subCategoryID
  );
  if (!deletedSubCategory) {
    return next(
      new ApiError(`subCategory ID ${req.params.subCategoryID} not exists`, 404)
    );
  }
  res.status(202).json({ success: true, message: "deleted successfully!" });
});
