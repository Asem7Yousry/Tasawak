const Order = require("../models/order.Model");
const ApiError = require("../utils/apiError");
const { publishOrderEvent } = require("../producers/order.producer");

class PaymentLifecycle {
  static async markPaid({ orderId, paymentId, provider }) {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, isPaid: { $ne: true }, status: { $ne: "canceled" } },
      {
        $set: {
          isPaid: true,
          paymentStatus: "paid",
          paidAt: new Date(),
          status: "shipped",
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

    await publishOrderEvent("payment.success", {
      orderId: order._id.toString(),
      paymentId,
      paymentProvider: provider,
      userId: order.userId.toString(),
      totalPrice: order.totalPrice,
    });
    return order;
  }

  static async markFailed({ orderId, paymentId, provider }) {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, isPaid: { $ne: true }, status: { $ne: "canceled" }, paymentStatus: { $ne: "failed" } },
      { $set: { paymentStatus: "failed", paymentId, paymentProvider: provider } },
      { new: true },
    );
    if (!order) {
      const existing = await Order.findById(orderId);
      if (!existing) throw new ApiError("Order not found", 404);
      return existing;
    }
    await publishOrderEvent("payment.failure", {
      orderId: order._id.toString(), paymentId, paymentProvider: provider,
      userId: order.userId.toString(), totalPrice: order.totalPrice,
    });
    return order;
  }
}

module.exports = PaymentLifecycle;
