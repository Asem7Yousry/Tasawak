const subCategoryServ = require("../services/subcategory.service");
const factory = require("./factoryHandler");

// @doc create new subCategory with parent category id (catgoryID)
// @route Post /api/subCategory
// @access private
exports.createSubCategory = factory.createDoc(subCategoryServ);

// @doc get all subCategories
// @route Get /api/subCategory
// @access public
exports.getAllSubCategory = factory.getAllDoc(subCategoryServ, "subCategory");

// @doc get specific subCategory by ID
// @route Get /api/subCategory/:subCategoryID
// @access public
exports.getSpecificSubCategory = factory.getSpecificDoc(
  subCategoryServ,
  "subCategory",
  "subCategoryID",
);

// @doc update specific subCategory by ID
// @route put /api/subCategory/:subCategoryID
// @access private
exports.updateSpecificSubCategory = factory.updateSpecificDoc(
  subCategoryServ,
  "subCategory",
  "subCategoryID",
);

// @doc delete specific subCategory by ID
// @route delete /api/subCategory/:subsubCategoryID
// @access private
exports.deleteSpecificSubCategory = factory.deleteSpecificDoc(
  subCategoryServ,
  "subCategory",
  "subCategoryID",
);
