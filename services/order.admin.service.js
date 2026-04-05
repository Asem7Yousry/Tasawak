const Order = require("../models/order.Model");
const { QueryListing } = require("../utils/queryListing");

// list all orders for a admin
exports.list = async (req) => QueryListing(Order, req.query);

// get specific order for a user
exports.getById = (id) => Order.findById(id);

// update specific order for a user
exports.updateById = (id, updateData) =>
  Order.findByIdAndUpdate(id, updateData, { new: true });
