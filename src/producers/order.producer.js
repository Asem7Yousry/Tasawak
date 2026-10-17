// src/producers/order.producer.js
const { getChannel } = require("../config/rabbitmq");
const { ORDER_EXCHANGE, PAYMENT_EXCHANGE } = require("../rabbitmq/exchanges");

async function publishOrderEvent(eventName, payload) {
  const channel = getChannel();
  const isPaymentEvent = eventName.startsWith("payment.");
  channel.publish(
    isPaymentEvent ? PAYMENT_EXCHANGE : ORDER_EXCHANGE,
    eventName,
    Buffer.from(JSON.stringify({ eventName, occurredAt: new Date().toISOString(), ...payload })),
    {
      persistent: true,
      contentType: "application/json",
    },
  );
}

async function publishOrderCreated(order, user, eventName = "order.created") {
  const price = order.totalAfterDiscount || order.totalPrice;
  return publishOrderEvent(eventName, {
    order,
    paymentProvider: order.paymentProvider,
    totalPrice: price,
    userId: user._id.toString(),
    userEmail: user.email,
    first_name: user.fullName?.first_name,
    last_name: user.fullName?.last_name,
  });
}

module.exports = {
  publishOrderEvent,
  publishOrderCreated,
};
