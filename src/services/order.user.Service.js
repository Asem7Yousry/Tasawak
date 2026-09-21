const Order = require("../models/order.Model");
const { QueryListing } = require("../utils/queryListing");
const { checkOut } = require("../utils/order.methods");
const ApiError = require("../utils/apiError");
const { subscription } = require("../utils/stripe.methods");
const commonService = require("./common.service");

class orderService extends commonService {
  async create(req) {
    const order = await checkOut(req);
    return order;
  }

  // get specific order for a user
  async getMyOrder(req, searchData = {}) {
    searchData._id = req.params["orderId"];
    searchData.userId = req.user._id;
    const order = await Order.findOne(searchData);
    if (!order) {
      throw new ApiError("not permitted", 403);
    }
    return order;
  }

  // cancel order
  async cancelOrder(orderId) {
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: "canceled", canceledAt: new Date() },
      { new: true },
    );
    if (!order) {
      throw new ApiError("order can't be canceled", 404);
    }
    return order;
  }

  // subscription
  async subscription(req) {
    const subSession = await subscription(req);
    return subSession;
  }
}

module.exports = new orderService(Order);
