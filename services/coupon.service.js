const Coupon = require("../models/coupon.model");
const { QueryListing } = require("../utils/queryListing");

// create Coupon
exports.create = (req) => Coupon.create(req.body);

// list all Coupons
exports.list = (req) => {
  return QueryListing(Coupon, req.query);
};

// get specific Coupon
exports.getById = (id) => Coupon.findById(id);

exports.updateById = (id, updates) =>
  Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAll = () => Coupon.deleteMany({});

exports.deleteById = (id) => Coupon.findByIdAndDelete(id);
