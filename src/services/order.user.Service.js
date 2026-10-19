const Order = require("../models/order.Model");
const { getCart } = require("./cart.service");
const ApiError = require("../utils/apiError");
const { subscription } = require("../utils/stripe.methods");
const commonService = require("./common.service");
const paymentFactory = require("../payments/payment.factory");

class orderService extends commonService {
  async create(req) {
    const userId = req.user._id;
    // get cart items
    const cart = await getCart(userId);
    if (!cart || Object.values(cart.items).length === 0) {
      throw new ApiError("no cart found", 404);
    }
    // check payment provider and method from request headers or body
    const paymentProvider = String(
      req.body?.paymentprovider || req.headers["paymentprovider"] || "cash",
    ).toLowerCase();
    const providerStrategy = paymentFactory.create(paymentProvider);
    return providerStrategy.initiate({ req, cart });
  }

  // get specific order for a user
  async getMyOrder(req, searchData = {}) {
    searchData._id = req.params["orderId"];
    searchData.userId = req.user._id;
    const order = await this.model.findOne(searchData);
    if (!order) {
      throw new ApiError("not permitted", 403);
    }
    return order;
  }

  // cancel order
  async cancelOrder(orderId) {
    const order = await this.model.findOneAndUpdate(
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
