const Order = require("../models/order.Model");
const ApiError = require("../utils/apiError");
const { publishOrderEvent } = require("../producers/order.producer");

class PaymentLifecycle {
  static async markPaid({ orderId, paymentId, provider }) {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, isPaid: { $ne: true } },
      {
        $set: {
          isPaid: true,
          paymentStatus: "paid",
          paidAt: new Date(),
          status: "pending",
          paymentId,
          paymentMethod: provider,
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

    await publishOrderEvent("payment.succeeded", {
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
      { _id: orderId, isPaid: { $ne: true }, paymentStatus: { $ne: "failed" } },
      { $set: { paymentStatus: "failed", paymentId, paymentMethod: provider } },
      { new: true },
    );
    if (!order) {
      const existing = await Order.findById(orderId);
      if (!existing) throw new ApiError("Order not found", 404);
      return existing;
    }
    await publishOrderEvent("payment.failed", {
      orderId: order._id.toString(), paymentId, paymentProvider: provider,
      userId: order.userId.toString(), totalPrice: order.totalPrice,
    });
    return order;
  }
}

module.exports = PaymentLifecycle;
