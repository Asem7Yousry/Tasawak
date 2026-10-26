const { getChannel } = require("../config/rabbitmq");
const { PAYMENT_REFUND_QUEUE } = require("../rabbitmq/queues");
const stripe = require("../config/stripe.config");

async function startPaymentConsumer() {
  const channel = getChannel();
  channel.prefetch(1);

  await channel.consume(PAYMENT_REFUND_QUEUE, async (message) => {
    if (!message) return;
    try {
      const event = JSON.parse(message.content.toString());
      if (!event.paymentIntentId) throw new Error("Refund message is missing paymentIntentId");

      const refundParams = { payment_intent: event.paymentIntentId };
      if (Number.isFinite(Number(event.amount)) && Number(event.amount) > 0) {
        refundParams.amount = Math.round(Number(event.amount) * 100);
      }

      await stripe.refunds.create(refundParams, {
        idempotencyKey: event.idempotencyKey || `refund:${event.orderId || event.paymentIntentId}`,
      });
      channel.ack(message);
    } catch (error) {
      console.error("Failed to refund payment", error);
      channel.nack(message, false, true);
    }
  }, { noAck: false });
}

module.exports = { startPaymentConsumer };
