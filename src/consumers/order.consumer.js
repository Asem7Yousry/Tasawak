// consumer for order created messages from RabbitMQ
const { getChannel } = require("../config/rabbitmq");
const { ORDER_CREATED_QUEUE } = require("../rabbitmq/queues");
// const { notify } = require("../utils/orderNotifications");

async function startOrderConsumer() {
  const channel = getChannel();
  await channel.consume(ORDER_CREATED_QUEUE, async (message) => {
    if (!message) {
      return;
    }

    try {
      const data = JSON.parse(message.content.toString());
      // await notify(data);
      channel.ack(message);
    } catch (error) {
      console.error("Failed to handle order event", error);
      channel.nack(message, false, true);
    }
  });
}

module.exports = {
  startOrderConsumer,
};
