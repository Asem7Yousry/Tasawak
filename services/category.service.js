const Category = require("../models/categoryModel");
const { QueryListing } = require("../utils/queryListing");

// create Category
exports.create = (req) => Category.create(req.body);

// list all categories
exports.list = (req) => {
  return QueryListing(Category, req.query);
};

// get specific category
exports.getById = (id) => Category.findById(id);

exports.updateById = (id, updates) =>
  Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAll = () => Category.deleteMany({});

exports.deleteById = (id) => Category.findByIdAndDelete(id);
