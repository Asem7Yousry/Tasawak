const { getChannel } = require("../config/rabbitmq");
const { ORDER_EXCHANGE, PAYMENT_EXCHANGE, EMAIL_EXCHANGE } = require("../rabbitmq/exchanges");
const { publishCartDelete } = require("./cart.producer");

function publish(exchange, routingKey, payload, options = {}) {
  const channel = getChannel();
  return channel.publish(
    exchange,
    routingKey,
    Buffer.from(JSON.stringify({ ...payload, occurredAt: new Date().toISOString() })),
    { persistent: true, contentType: "application/json", ...options },
  );
}

function publishEmail(eventName, payload) {
  return publish(EMAIL_EXCHANGE, "send.email", { eventName, ...payload });
}

function publishOrderUpdate(eventName, payload) {
  return publish(ORDER_EXCHANGE, "order.update", { eventName, ...payload });
}

function publishInventoryRestore(orderId, reason = "canceled") {
  return publish(ORDER_EXCHANGE, "inventory.restore", { orderId: String(orderId), reason });
}

function publishRefund(paymentIntentId, amount, orderId) {
  return publish(
    PAYMENT_EXCHANGE,
    "payment.refund",
    {
      paymentIntentId,
      amount,
      orderId: orderId == null ? undefined : String(orderId),
      idempotencyKey: `refund:${orderId || paymentIntentId}`,
    },
  );
}

async function publishOrderEvent(eventName, payload, options = {}) {
  if (eventName === "payment.success" || eventName === "payment.failed") {
    await publishEmail(eventName, payload);
    await publishOrderUpdate(eventName, payload);
    return;
  }
  if (eventName === "order.created") {
    await publishEmail(eventName, payload);
    await publishCartDelete(payload.userId);
    return;
  }
  if (eventName === "order.failed.pay") {
    return publish(ORDER_EXCHANGE, "order.failed.pay", payload, options);
  }
  return publish(ORDER_EXCHANGE, eventName, payload, options);
}

function publishPasswordOtp(email, otp) {
  return publishEmail("password.otp", { email, otp: String(otp) });
}

module.exports = {
  publishEmail,
  publishOrderEvent,
  publishOrderUpdate,
  publishInventoryRestore,
  publishRefund,
  publishPasswordOtp,
};
