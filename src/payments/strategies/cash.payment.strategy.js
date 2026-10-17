const Order = require("../../models/order.Model");
const ApiError = require("../../utils/apiError");
const { publishOrderCreated } = require("../../producers/order.producer");

class CashPaymentStrategy {
  async initiate({ req, cart }) {
    // Cash on delivery needs no provider session. Keep the order unpaid 
    try {
      const paymentMethod = String(
        req.body?.paymentmethod || req.headers["paymentmethod"] || "in delivery",
      ).toLowerCase();
      const { _id, syncToken, ...orderData } = cart;
      orderData.paymentprovider = "cash";
      orderData.paymentMethod = paymentMethod;
      orderData.status = "shipping";
      const order = await Order.create(orderData);
      const totalPrice = order.totalAfterDiscount ? order.totalAfterDiscount : order.totalPrice;
      await publishOrderCreated(order, req.user, "payment.cash.created");
      return {
        order: order,
        paymentProvider: "cash",
        paymentRequired: false,
        status: order.status,
        totalPrice,
      };
    }
    catch (error) {
      throw new ApiError("Failed to create order", 500);
    }
  }
}

module.exports = CashPaymentStrategy;
