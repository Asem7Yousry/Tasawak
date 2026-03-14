const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const brandServices = require("../services/brand.service");

// @doc create new brand
// @route Post /api/brand
// @access private
exports.createBrand = asyncHandler(async (req, res, next) => {
  try {
    const newbrand = await brandServices.createBrand(req.body.title);
    res.status(201).json({
      success: true,
      message: "created successfully!",
      brand: newbrand,
    });
  } catch (error) {
    if (error.code === 11000) {
      // duplicate title mongo error
      return next(new ApiError(`title:${req.body.title} already exists`, 409));
    }
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc get all Brands
// @route Get /api/brand
// @access public
exports.getAllBrand = asyncHandler(async (req, res) => {
  // apply pagination and filteration
  let allBrands = await brandServices.listBrands(req.query);
  if (!allBrands) {
    res.status(404).json({
      success: false,
      message: "no brands found",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "got brand successfully",
    data: { length: allBrands.length, page: req.query.pageSize, allBrands },
  });
});

// @doc get specific brand by ID
// @route Get /api/brand/:brandID
// @access public
exports.getSpecificBrand = asyncHandler(async (req, res, next) => {
  let specificBrand = await brandServices.getBrandById(req.params.brandID);
  if (!specificBrand) {
    return next(new ApiError(`brand ID ${req.params.brandID} not exists`, 404));
  }
  res.status(200).json({
    success: true,
    message: "got brand successfully!",
    brand: specificBrand,
  });
});

// @doc update specific brand by ID
// @route put /api/brand/:brandID
// @access private
exports.updateSpecificBrand = asyncHandler(async (req, res, next) => {
  let specificBrand = await brandServices.updateBrandById(
    req.params.brandID,
    req.body,
  );
  if (!specificBrand) {
    return next(new ApiError(`brand ID ${req.params.brandID} not exists`, 404));
  }
  res.status(202).json({
    success: true,
    message: "updated brand successfully!",
    brand: specificBrand,
  });
});

// @doc delete specific brand by ID
// @route delete /api/brand/:brandID
// @access private
exports.deleteSpecificBrand = asyncHandler(async (req, res, next) => {
  let deletedbrand = await brandServices.deleteBrandById(req.params.brandID);
  if (!deletedbrand) {
    return next(new ApiError(`brand ID ${req.params.brandID} not exists`, 404));
  }
  res
    .status(202)
    .json({ success: true, message: "deleted successfully!", data: null });
});
