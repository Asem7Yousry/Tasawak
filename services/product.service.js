const Product = require("../models/productModel");
const { QueryListing } = require("../utils/queryListing");

// create Product
exports.createProduct = (data) => Product.create(data);

// list all Products
exports.listProducts = (query) => {
    
  const apiQuery = new QueryListing(Product, query);
  apiQuery.apply();
  return apiQuery.dbQuery;
};

// get specific Product
exports.getProductById = (id) => Product.findById(id);

exports.updateProductById = (id, updates) =>
  Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAllProducts = () => Product.deleteMany({});

exports.deleteProductById = (id) => Product.findByIdAndDelete(id);
