const factory = require("./factoryHandler");
const categoryServices = require("../services/category.service");

// @doc create new Category
// @route Post /api/category
// @access private
exports.createCategory = factory.createDoc(categoryServices);

// @doc get all Categories
// @route Get /api/category
// @access public
exports.getAllCategory = factory.getAllDoc(categoryServices, "Category");

// @doc get specific category by ID
// @route Get /api/category/:categoryID
// @access public
exports.getSpecificCategory = factory.getSpecificDoc(
  categoryServices,
  "Category",
  "categoryID",
);

// @doc update specific category by ID
// @route put /api/category/:categoryID
// @access private
exports.updateSpecificCategory = factory.updateSpecificDoc(
  categoryServices,
  "Category",
  "categoryID",
);

// @doc delete specific category by ID
// @route delete /api/category/:categoryID
// @access private
exports.deleteSpecificCategory = factory.deleteSpecificDoc(
  categoryServices,
  "Category",
  "categoryID",
);

// @doc delete specific category by ID
// @route delete /api/category/:categoryID
// @access private
exports.deleteAllCategory = factory.deleteAllDocs(categoryServices, "Category");
