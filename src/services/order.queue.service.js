const mongoose = require("mongoose");
const Order = require("../models/order.Model");
const { productVariation } = require("../models/productModel");

const CANCELLATION_DELAY_MS = 72 * 60 * 60 * 1000; // 3 days

class OrderQueueService {
  static async cancelIfUnpaid(orderId, now = new Date()) {
    const session = await mongoose.startSession();
    let canceledOrder = null;
    try {
      await session.withTransaction(async () => {
        canceledOrder = await Order.findOneAndUpdate(
          {
            _id: orderId,
            // paymentProvider: "stripe",
            isPaid: { $ne: true },
            paymentStatus: { $ne: "paid" },
            status: { $in: ["pending"] },
            createdAt: { $lte: new Date(now.getTime() - CANCELLATION_DELAY_MS) },
          },
          {
            $set: { status: "canceled", canceledAt: now },
          },
          { new: true, session },
        );

        if (canceledOrder) {
          const quantities = new Map();
          for (const item of Object.values(canceledOrder.items || {})) {
            const variationId = item.variationId;
            const quantity = Number(item.quantity);
            if (variationId && Number.isFinite(quantity) && quantity > 0) {
              quantities.set(String(variationId), (quantities.get(String(variationId)) || 0) + quantity);
            }
          }
          for (const [variationId, quantity] of quantities) {
            const result = await productVariation.updateOne(
              { _id: variationId },
              { $inc: { quantity } },
              { session },
            );
            if (result.matchedCount !== 1) throw new Error(`Variation ${variationId} not found during stock restoration`);
          }
        }
      });
    } finally {
      await session.endSession();
    }

    if (canceledOrder) return canceledOrder;
    const current = await Order.findById(orderId);
    if (current?.cancellationReason === "unpaid_timeout") return current;
    return null;
  }
}

module.exports = OrderQueueService;
