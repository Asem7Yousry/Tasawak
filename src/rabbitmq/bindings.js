// bind exchanges(routes) with queues by routing key
const { getChannel } = require("../config/rabbitmq");

const { ORDER_EXCHANGE, PAYMENT_EXCHANGE } = require("./exchanges");

const { ORDER_CREATED_QUEUE, PAYMENT_COMPLETED_QUEUE } = require("./queues");

async function setupBindings() {
  const channel = getChannel();

  await channel.bindQueue(ORDER_CREATED_QUEUE, ORDER_EXCHANGE, "order.created");

  await channel.bindQueue(
    PAYMENT_COMPLETED_QUEUE,
    PAYMENT_EXCHANGE,
    "payment.completed",
  );
}

module.exports = {
  setupBindings,
};
