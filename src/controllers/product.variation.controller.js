const productServices = require("../services/product.variations.services");
const factory = require("./factoryHandler");

// @doc create new Product variation
// @route Post /api/Product/:productId/variation/
// @access private
exports.createProductVariation = factory.createDoc(productServices);

// @doc update specific Product by ID
// @route put /api/Product/:productId/variations/:productVariationId
// @access private
exports.updateSpecificProductVariation = factory.updateSpecificDoc(
  productServices,
  "Product variation",
  "productVariationId",
);

// @doc delete specific Product by ID
// @route delete /api/Product/:productId/variations/:productVariationId
// @access private
exports.deleteSpecificProductVariation = factory.deleteSpecificDoc(
  productServices,
  "Product variation",
  "productVariationId",
);
