// src/producers/order.producer.js
const { getChannel } = require("../config/rabbitmq");
const { ORDER_EXCHANGE, PAYMENT_EXCHANGE } = require("../rabbitmq/exchanges");
const { ORDER_CANCEL_DELAY_MS } = require("../rabbitmq/queues");

async function publishOrderEvent(eventName, payload, options = {}) {
  const channel = getChannel();
  const isPaymentEvent = eventName.startsWith("payment.");
  channel.publish(
    isPaymentEvent ? PAYMENT_EXCHANGE : ORDER_EXCHANGE,
    eventName,
    Buffer.from(JSON.stringify({ eventName, occurredAt: new Date().toISOString(), ...payload })),
    {
      persistent: true,
      contentType: "application/json",
      ...options,
    },
  );
}

async function publishOrderCreated(order, user, eventName = "order.created") {
  const price = order.totalAfterDiscount || order.totalPrice;
  const payload = {
    order,
    paymentProvider: order.paymentProvider,
    totalPrice: price,
    userId: user._id.toString(),
    userEmail: user.email,
    first_name: user.fullName?.first_name,
    last_name: user.fullName?.last_name,
  };
  if (order.paymentProvider != "cash") {
    const orderCreatedAt = new Date(order.createdAt || Date.now()).getTime();
    const remainingDelay = Math.max(0, orderCreatedAt + ORDER_CANCEL_DELAY_MS - Date.now());
    await publishOrderEvent("order.cancel.delay", { orderId: order._id.toString() }, { expiration: String(remainingDelay) });
  }
  await publishOrderEvent("order.created", payload);
  if (eventName !== "order.created") await publishOrderEvent(eventName, payload);
}

module.exports = {
  publishOrderEvent,
  publishOrderCreated,
};
