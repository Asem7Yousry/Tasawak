const Order = require("../models/order.Model");
const ApiError = require("../utils/apiError");
const { publishOrderEvent } = require("../producers/order.producer");

class PaymentLifeCycle {
  static async markPaid({ orderId, paymentId, provider }) {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, paymentStatus: { $ne: "paid" }, status: { $ne: "canceled" } },
      {
        $set: {
          paymentStatus: "paid",
          paidAt: new Date(),
          status: "shipping",
          paymentId,
          paymentProvider: provider,
        },
      },
      { new: true },
    );

    // Webhooks are at-least-once. A duplicate success must not emit a second
    // event or repeat the cart cleanup.
    if (!order) {
      const existing = await Order.findById(orderId);
      if (!existing) throw new ApiError("Order not found", 404);
      return existing;
    }
  }

  static async markFailed({ orderId, paymentId, provider }) {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, status: { $ne: "canceled" }, paymentStatus: { $ne: "failed" } },
      { $set: { paymentStatus: "failed", paymentId, paymentProvider: provider } },
      { new: true },
    );
    if (!order) {
      const existing = await Order.findById(orderId);
      if (!existing) throw new ApiError("Order not found", 404);
      return existing;
    }
    await publishOrderEvent("order.failed.pay", { orderId: order._id })
  }
}

module.exports = PaymentLifeCycle;
