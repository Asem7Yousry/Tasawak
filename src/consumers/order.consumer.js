const mongoose = require("mongoose");
const { getChannel } = require("../config/rabbitmq");
const {
  ORDER_UPDATE_QUEUE,
  INVENTORY_RESTORE_QUEUE,
  ORDER_CANCEL_DELAY_MS,
} = require("../rabbitmq/queues");
const Order = require("../models/order.Model");
const { productVariation } = require("../models/productModel");
const paymentLifeCycle = require("../payments/payment.lifecycle");

function getPaymentKind(eventName) {
  if (["payment.success"].includes(eventName)) return "paid";
  if (["payment.failed"].includes(eventName)) return "failed";
  return null;
}

async function restoreInventory(orderId, reason) {
  const session = await mongoose.startSession();
  let processedOrder = null;
  try {
    await session.withTransaction(async () => {
      const now = new Date();
      const timeoutCutoff = new Date(now.getTime() - ORDER_CANCEL_DELAY_MS);
      const base = {
        _id: orderId,
        isPaid: { $ne: true },
        paymentStatus: { $ne: "paid" },
        inventoryRestoredAt: { $exists: false },
      };
      let query;
      let update;

      if (reason === "timeout") {
        query = {
          ...base,
          status: "pending",
          createdAt: { $lte: timeoutCutoff },
        };
        update = {
          $set: {
            status: "canceled",
            canceledAt: now,
            cancellationReason: "unpaid_timeout",
            inventoryRestoredAt: now,
          },
        };
      } else {
        query = { ...base, status: "canceled" };
        update = { $set: { inventoryRestoredAt: now } };
      }

      processedOrder = await Order.findOneAndUpdate(query, update, { new: true, session });
      if (!processedOrder) return;

      const quantities = new Map();
      for (const item of Object.values(processedOrder.items || {})) {
        const variationId = item.variationId;
        const quantity = Number(item.quantity);
        if (variationId && Number.isFinite(quantity) && quantity > 0) {
          const key = String(variationId);
          quantities.set(key, (quantities.get(key) || 0) + quantity);
        }
      }

      for (const [variationId, quantity] of quantities) {
        const result = await productVariation.updateOne(
          { _id: variationId },
          { $inc: { quantity } },
          { session },
        );
        if (result.matchedCount !== 1) {
          throw new Error(`Variation ${variationId} not found while restoring inventory`);
        }
      }
    });
  } finally {
    await session.endSession();
  }
  return processedOrder;
}

async function startOrderConsumer() {
  const channel = getChannel();
  channel.prefetch(1);

  await channel.consume(ORDER_UPDATE_QUEUE, async (message) => {
    if (!message) return;
    const messageData = JSON.parse(message.content.toString());
    try {
      let paymentData = {
        orderId: messageData.orderId,
        provider: messageData.provider,
        paymentId: messageData?.paymentId,
      }
      let paymentStatus = getPaymentKind(messageData.eventName);
      if (paymentStatus === "paid") {
        await paymentLifeCycle.markPaid(paymentData);
      } else {
        await paymentLifeCycle.markFailed(paymentData);
      }
      channel.ack(message);
    } catch (error) {
      console.error("Failed to apply order update", error);
      channel.nack(message, false, true);
    }
  }, { noAck: false });

  await channel.consume(INVENTORY_RESTORE_QUEUE, async (message) => {
    if (!message) return;
    try {
      const event = JSON.parse(message.content.toString());
      if (!event.orderId) throw new Error("Inventory restore message is missing orderId");
      await restoreInventory(event.orderId, event.reason || "timeout");
      channel.ack(message);
    } catch (error) {
      console.error("Failed to restore order inventory", error);
      channel.nack(message, false, true);
    }
  }, { noAck: false });
}

module.exports = { startOrderConsumer, restoreInventory };
