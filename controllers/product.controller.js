const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { filterPagination } = require("../utils/filterPaginationMethod");
const productServices = require("../services/product.service");

// @doc create new Product
// @route Post /api/Product
// @access private
exports.createProduct = asyncHandler(async (req, res, next) => {
  try {
    const newProduct = await productServices.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: "created successfully!",
      Product: newProduct,
    });
  } catch (error) {
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc get all Products
// @route Get /api/Product
// @access public
exports.getAllProducts = asyncHandler(async (req, res) => {
  let allProducts = await productServices.listProducts(req.query);
  res.status(200).json({
    success: true,
    message: "got product sccussfully!",
    data: {
      length: allProducts.length,
      page: req.query.pageNumber,
      allProducts,
    },
  });
});

// @doc get specific Product by ID
// @route Get /api/Product/:productID
// @access public
exports.getSpecificProduct = asyncHandler(async (req, res, next) => {
  let specificProduct = await productServices.getProductById(
    req.params.productID,
  );
  if (!specificProduct) {
    return next(
      new ApiError(`Product ID ${req.params.productID} not exists`, 404),
    );
  }
  res.status(200).json({ success: true, Product: specificProduct });
});

// @doc update specific Product by ID
// @route put /api/Product/:productID
// @access private
exports.updateSpecificProduct = asyncHandler(async (req, res, next) => {
  let specificProduct = await productServices.updateProductById(
    req.params.productID,
    req.body,
  );
  if (!specificProduct) {
    return next(
      new ApiError(`Product ID ${req.params.productID} not exists`, 404),
    );
  }
  res.status(202).json({
    success: true,
    message: "updated Successfully!",
    Product: specificProduct,
  });
});

// @doc delete specific Product by ID
// @route delete /api/Product/:productID
// @access private
exports.deleteSpecificProduct = asyncHandler(async (req, res, next) => {
  let deletedProduct = await productServices.deleteProductById(
    req.params.productID,
  );
  if (!deletedProduct) {
    return next(
      new ApiError(`Product ID ${req.params.productID} not exists`, 404),
    );
  }
  res.status(202).json({ success: true, message: "deleted successfully!" });
});
