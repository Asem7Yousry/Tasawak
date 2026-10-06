// bind exchanges(routes) with queues by routing key
const { getChannel } = require("../config/rabbitmq");

const {
  ORDER_EXCHANGE,
  PAYMENT_EXCHANGE,
  CART_DELAY_EXCHANGE,
  CART_MAIN_EXCHANGE,
} = require("./exchanges");

const {
  ORDER_CREATED_QUEUE,
  PAYMENT_COMPLETED_QUEUE,
  CART_DELAY_QUEUE,
  CART_MAIN_QUEUE,
} = require("./queues");

async function setupBindings() {
  const channel = getChannel();

  await channel.bindQueue(ORDER_CREATED_QUEUE, ORDER_EXCHANGE, "order.created");

  await channel.bindQueue(
    PAYMENT_COMPLETED_QUEUE,
    PAYMENT_EXCHANGE,
    "payment.completed",
  );

  await channel.bindQueue(CART_DELAY_QUEUE, CART_DELAY_EXCHANGE, "cart.delay");
  await channel.bindQueue(CART_MAIN_QUEUE, CART_MAIN_EXCHANGE, "cart.update");
}

module.exports = {
  setupBindings,
};
