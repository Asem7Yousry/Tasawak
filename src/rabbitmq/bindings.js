// bind exchanges(routes) with queues by routing key
const { getChannel } = require("../config/rabbitmq");

const {
  ORDER_EXCHANGE,
  PAYMENT_EXCHANGE,
  CART_EXCHANGE,
  EMAIL_EXCHANGE,
} = require("./exchanges");

const {
  EMAIL_QUEUE,
  INVENTORY_RESTORE_QUEUE,
  PAYMENT_REFUND_QUEUE,
  CART_DELETE_QUEUE,
  CART_DELAY_QUEUE,
  CART_MAIN_QUEUE,
  ORDER_UPDATE_QUEUE,
  ORDER_FAILED_PAY_DELAY_QUEUE,
} = require("./queues");

async function setupBindings() {
  const channel = getChannel();

  await channel.bindQueue(EMAIL_QUEUE, EMAIL_EXCHANGE, "send.email");

  await channel.bindQueue(INVENTORY_RESTORE_QUEUE, ORDER_EXCHANGE, "inventory.restore");
  await channel.bindQueue(PAYMENT_REFUND_QUEUE, PAYMENT_EXCHANGE, "payment.refund");

  await channel.bindQueue(ORDER_UPDATE_QUEUE, ORDER_EXCHANGE, "order.update");
  await channel.bindQueue(ORDER_FAILED_PAY_DELAY_QUEUE, ORDER_EXCHANGE, "order.failed.pay");

  await channel.bindQueue(CART_DELETE_QUEUE, CART_EXCHANGE, "cart.delete");
  await channel.bindQueue(CART_DELAY_QUEUE, CART_EXCHANGE, "cart.delay");
  await channel.bindQueue(CART_MAIN_QUEUE, CART_EXCHANGE, "cart.update");
}

module.exports = {
  setupBindings,
};
