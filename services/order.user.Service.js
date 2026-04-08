const Order = require("../models/order.Model");
const { QueryListing } = require("../utils/queryListing");
const { checkOut } = require("../utils/order.methods");
const ApiError = require("../utils/apiError");

// create order with cash payment method
exports.create = async (req) => {
  const order = await checkOut(req);
  return order;
};

// list all orders for a user
exports.list = async (req) => {
  let query = req.query;
  query["userId"] = req.user._id;
  return QueryListing(Order, query);
};

// get specific order for a user
exports.getMyOrder = async (req) => {
  const order = await Order.findOne({
    _id: req.params["orderId"],
    userId: req.user._id,
  });
  if (!order) {
    throw new ApiError("not permitted", 403);
  }
  return order;
};
