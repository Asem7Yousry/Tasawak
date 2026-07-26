const factory = require("./factoryHandler");
const brandServices = require("../services/brand.service");

// @doc create new brand
// @route Post /api/brand
// @access private
exports.createBrand = factory.createDoc(brandServices);

// @doc get all Brands
// @route Get /api/brand
// @access public
exports.getAllBrand = factory.getAllDoc(brandServices, "Brand");

// @doc get specific brand by ID
// @route Get /api/brand/:brandID
// @access public
exports.getSpecificBrand = factory.getSpecificDoc(
  brandServices,
  "Brand",
  "brandID",
);

// @doc update specific brand by ID
// @route put /api/brand/:brandID
// @access private
exports.updateSpecificBrand = factory.updateSpecificDoc(
  brandServices,
  "Brand",
  "brandID",
);

// @doc delete specific brand by ID
// @route delete /api/brand/:brandID
// @access private
exports.deleteSpecificBrand = factory.deleteSpecificDoc(
  brandServices,
  "Brand",
  "brandID",
);
