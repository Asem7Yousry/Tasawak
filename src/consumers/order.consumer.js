// consumer for order created messages from RabbitMQ
const { getChannel } = require("../config/rabbitmq");

const { ORDER_CREATED_QUEUE } = require("../rabbitmq/queues");

async function startOrderConsumer() {
  const channel = getChannel();
  await channel.consume(ORDER_CREATED_QUEUE, async (message) => {
    if (!message) {
      return;
    }

    try {
      const data = JSON.parse(message.content.toString());



      // Business logic
      // send email
      // update inventory
      // etc...

      channel.ack(message);
    } catch (error) {

    }
  });
}

module.exports = {
  startOrderConsumer,
};
