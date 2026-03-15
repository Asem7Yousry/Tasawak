const Brand = require("../models/brandModel");
const { QueryListing } = require("../utils/queryListing");

// create Brand
exports.createBrand = (title) => Brand.create({ title });

// list all Brands
exports.listBrands = (query) => {
  return QueryListing(Brand, query);
};

// get specific Brand
exports.getBrandById = (id) => Brand.findById(id);

exports.updateBrandById = (id, updates) =>
  Brand.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAllBrands = () => Brand.deleteMany({});

exports.deleteBrandById = (id) => Brand.findByIdAndDelete(id);
