const Category = require("../models/categoryModel");
const { QueryListing } = require("../utils/queryListing");

// create Category
exports.createCategory = (title) => Category.create({ title });

// list all categories
exports.listCategories = (query) => {
  return QueryListing(Category, query);
};

// get specific category
exports.getCategoryById = (id) => Category.findById(id);

exports.updateCategoryById = (id, updates) =>
  Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAllCategorys = () => Category.deleteMany({});

exports.deleteCategoryById = (id) => Category.findByIdAndDelete(id);
