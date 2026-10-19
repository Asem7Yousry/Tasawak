// consumer for order created messages from RabbitMQ
const { getChannel } = require("../config/rabbitmq");
const { ORDER_CREATED_QUEUE, ORDER_CANCEL_QUEUE } = require("../rabbitmq/queues");
const { notify } = require("../utils/orderNotifications");
const OrderQueueService = require("../services/order.queue.service");
const { deleteCart } = require("../services/cart.service");
const { delCache } = require("../utils/redis.methods");

async function invalidateOrderProducts(order) {
  // clear all products of cancelled order from cache
  const productIds = new Set(Object.values(order.items || {}).map((item) => item.productId).filter(Boolean).map(String));
  await Promise.all([...productIds].map((id) => delCache(`product_${id}`)));
}

async function startOrderConsumer() {
  const channel = getChannel();
  await channel.consume(ORDER_CREATED_QUEUE, async (message) => {
    if (!message) {
      return;
    }

    try {
      const data = JSON.parse(message.content.toString());
      if (data.eventName !== "order.created") {
        channel.ack(message);
        return;
      }
      await deleteCart(data.userId);
      await notify(data);
      channel.ack(message);
    } catch (error) {
      console.error("Failed to handle order event", error);
      channel.nack(message, false, true);
    }
  });

  await channel.consume(ORDER_CANCEL_QUEUE, async (message) => {
    if (!message) return;
    try {
      const data = JSON.parse(message.content.toString());
      const order = await OrderQueueService.cancelIfUnpaid(data.orderId);
      if (order) {
        await invalidateOrderProducts(order);
        await notify({ eventName: "order.canceled", orderId: order._id.toString() });
      }
      channel.ack(message);
    } catch (error) {
      console.error("Failed to handle delayed order cancellation", error);
      channel.nack(message, false, true);
    }
  });
}

module.exports = {
  startOrderConsumer,
};
