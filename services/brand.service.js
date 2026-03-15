const Brand = require("../models/brandModel");
const { QueryListing } = require("../utils/queryListing");

// create Brand
exports.create = (req) => Brand.create(req.body);

// list all Brands
exports.list = (req) => {
  return QueryListing(Brand, req.query);
};

// get specific Brand
exports.getById = (id) => Brand.findById(id);

exports.updateById = (id, updates) =>
  Brand.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAll = () => Brand.deleteMany({});

exports.deleteById = (id) => Brand.findByIdAndDelete(id);
