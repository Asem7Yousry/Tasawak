const productServices = require("../services/product.service");
const factory = require("./factoryHandler");

// @doc create new Product
// @route Post /api/Product
// @access private
exports.createProduct = factory.createDoc(productServices);

exports.test = productServices.test

// @doc get all Products
// @route Get /api/Product
// @access public
exports.getAllProducts = factory.getAllDoc(productServices, "Product");

// @doc get specific Product by ID
// @route Get /api/Product/:productID
// @access public
exports.getSpecificProduct = factory.getSpecificDoc(
  productServices,
  "Product",
  "productID",
);

// @doc update specific Product by ID
// @route put /api/Product/:productID
// @access private
exports.updateSpecificProduct = factory.updateSpecificDoc(
  productServices,
  "Product",
  "productID",
);

// @doc delete specific Product by ID
// @route delete /api/Product/:productID
// @access private
exports.deleteSpecificProduct = factory.deleteSpecificDoc(
  productServices,
  "Product",
  "productID",
);
