const { getChannel } = require("../config/rabbitmq");
const { PAYMENT_COMPLETED_QUEUE } = require("../rabbitmq/queues");
const { deleteCart } = require("../services/cart.service");
const { notify } = require("../utils/orderNotifications");

async function startPaymentConsumer() {
  const channel = getChannel();
  await channel.consume(PAYMENT_COMPLETED_QUEUE, async (message) => {
    if (!message) return;
    try {
      const event = JSON.parse(message.content.toString());
      const notificationEvent = {
        "payment.succeeded": "payment.success",
        "payment.failed": "payment.failure",
      }[event.eventName] || event.eventName;
      if (notificationEvent === "payment.success" || notificationEvent === "payment.failure") {
        await notify({ ...event, eventName: notificationEvent });
      }
      const paymentCreated = notificationEvent.endsWith(".created");
      if ((notificationEvent === "payment.success" || paymentCreated) && event.userId) {
        await deleteCart(event.userId);
      }
      channel.ack(message);
    } catch (error) {
      console.error("Failed to handle payment event", error);
      channel.nack(message, false, true);
    }
  });
}

module.exports = { startPaymentConsumer };
