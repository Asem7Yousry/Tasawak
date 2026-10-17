const { getChannel } = require("../config/rabbitmq");
const { PAYMENT_COMPLETED_QUEUE } = require("../rabbitmq/queues");
// const { notify } = require("../utils/orderNotifications");
const { deleteCart } = require("../services/cart.service");

async function startPaymentConsumer() {
  const channel = getChannel();
  await channel.consume(PAYMENT_COMPLETED_QUEUE, async (message) => {
    if (!message) return;
    try {
      const event = JSON.parse(message.content.toString());
      // await notify(event);
      await deleteCart(event.userId);
      channel.ack(message);
    } catch (error) {
      console.error("Failed to handle payment event", error);
      channel.nack(message, false, true);
    }
  });
}

module.exports = { startPaymentConsumer };
