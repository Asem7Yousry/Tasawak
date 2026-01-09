const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const {filterPagination} = require("../utils/filterPaginationMethod")

// @doc create new Product
// @route Post /api/Product
// @access private
exports.createProduct = asyncHandler(async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      success: true,
      Product: newProduct,
      message: "created successfully!",
    });
  } catch (error) {
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc get all Products
// @route Get /api/Product
// @access public
exports.getAllProducts = asyncHandler(async (req, res) => {
  [limit, page, skip, filter, sort, fields] = filterPagination(req.query);
  // get needed product from database
  let allProducts = await Product.find(filter, fields)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  res.status(200).json({
    success: true,
    length: allProducts.length,
    page,
    data: allProducts,
  });
});

// @doc get specific Product by ID
// @route Get /api/Product/:productID
// @access public
exports.getSpecificProduct = asyncHandler(async (req, res, next) => {
  let specificProduct = await Product.findById(req.params.productID);
  if (!specificProduct) {
    return next(
      new ApiError(`Product ID ${req.params.productID} not exists`, 404)
    );
  }
  res.status(200).json({ success: true, Product: specificProduct });
});

// @doc update specific Product by ID
// @route put /api/Product/:productID
// @access private
exports.updateSpecificProduct = asyncHandler(async (req, res, next) => {
  let specificProduct = await Product.findByIdAndUpdate(
    req.params.productID,
    req.body,
    { new: true }
  );
  if (!specificProduct) {
    return next(
      new ApiError(`Product ID ${req.params.productID} not exists`, 404)
    );
  }
  res.status(202).json({ success: true, Product: specificProduct });
});

// @doc delete specific Product by ID
// @route delete /api/Product/:productID
// @access private
exports.deleteSpecificProduct = asyncHandler(async (req, res, next) => {
  let deletedProduct = await Product.findByIdAndDelete(req.params.productID);
  if (!deletedProduct) {
    return next(
      new ApiError(`Product ID ${req.params.productID} not exists`, 404)
    );
  }
  res.status(202).json({ success: true, message: "deleted successfully!" });
});
