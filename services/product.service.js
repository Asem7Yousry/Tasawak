const Product = require("../models/productModel");
const { QueryListing } = require("../utils/queryListing");

// create Product
exports.create = (req) => Product.create(req.body);

// list all Products
exports.list = (req) => {
  return QueryListing(Product, req.query);
};

// get specific Product
exports.getById = (id) => Product.findById(id);

exports.updateById = (id, updates) =>
  Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAll = () => Product.deleteMany({});

exports.deleteById = (id) => Product.findByIdAndDelete(id);
