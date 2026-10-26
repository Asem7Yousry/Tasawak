const Order = require("../../models/order.Model");
const ApiError = require("../../utils/apiError");
const { publishOrderEvent } = require("../../producers/order.producer");

class CashPaymentStrategy {
  async initiate({ req, cart }) {
    // Cash on delivery needs no provider session. Keep the order unpaid 
    try {
      const { _id, syncToken, ...orderData } = cart;
      orderData.paymentprovider = "cash";
      orderData.paymentMethod = "in delivery";
      orderData.status = "shipping";
      const order = await Order.create(orderData);
      const userId = req.user._id;
      const orderId = order._id.toString();
      await publishOrderEvent("order.created", { orderId, userId });
      return {
        order: order,
        paymentProvider: "cash",
        paymentRequired: false,
        status: "shipping",
      };
    }
    catch (error) {
      throw new ApiError("Failed to create order", 500);
    }
  }
}

module.exports = CashPaymentStrategy;
