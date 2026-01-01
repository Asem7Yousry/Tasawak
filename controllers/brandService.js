const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @doc create new brand
// @route Post /api/brand
// @access private
exports.createBrand = asyncHandler(async (req, res, next) => {
  try {
    const newbrand = await Brand.create({
      title: req.body.title,
    });
    res.status(201).json({
      success: true,
      brand: newbrand,
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

// @doc get all Brands
// @route Get /api/brand
// @access public
exports.getAllBrand = asyncHandler(async (req, res) => {
  // apply pagination
  let limit = req.query.limit || 10;
  let page = req.query.page || 1;
  let skip = (page - 1) * limit;
  let allbrands = await Brand.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  res.status(200).json({
    success: true,
    length: allbrands.length,
    page,
    data: allbrands,
  });
});

// @doc get specific brand by ID
// @route Get /api/brand/:brandID
// @access public
exports.getSpecificBrand = asyncHandler(async (req, res, next) => {
  let specificbrand = await Brand.findById(req.params.brandID);
  if (!specificbrand) {
    return next(
      new ApiError(`brand ID ${req.params.brandID} not exists`, 404)
    );
  }
  res.status(200).json({ success: true, brand: specificbrand });
});

// @doc update specific brand by ID
// @route put /api/brand/:brandID
// @access private
exports.updateSpecificBrand = asyncHandler(async (req, res, next) => {
  let specificbrand = await Brand.findByIdAndUpdate(
    req.params.brandID,
    req.body,
    { new: true }
  );
  if (!specificbrand) {
    return next(
      new ApiError(`brand ID ${req.params.brandID} not exists`, 404)
    );
  }
  res.status(202).json({ success: true, brand: specificbrand });
});

// @doc delete specific brand by ID
// @route delete /api/brand/:brandID
// @access private
exports.deleteSpecificBrand = asyncHandler(async (req, res, next) => {
  let deletedbrand = await Brand.findByIdAndDelete(req.params.brandID);
  if (!deletedbrand) {
    return next(
      new ApiError(`brand ID ${req.params.brandID} not exists`, 404)
    );
  }
  res.status(202).json({ success: true, message: "deleted successfully!" });
});
