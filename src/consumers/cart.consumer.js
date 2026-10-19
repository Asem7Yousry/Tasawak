const { getChannel } = require("../config/rabbitmq");
const { CART_MAIN_QUEUE } = require("../rabbitmq/queues");
const { updateById, checkCachedCart } = require("../services/cart.service");

async function startCartConsumer() {
  const channel = getChannel();

  // prefetch 1 to distribute load
  channel.prefetch(1);

  channel.consume(
    CART_MAIN_QUEUE,
    async (msg) => {
      if (msg !== null) {
        try {
          const payload = JSON.parse(msg.content.toString());
          const { syncToken, userId } = payload;
          // Fetch the latest cart state from Redis
          let cart = await checkCachedCart(userId);

          if (!cart) {
            channel.ack(msg);
            return;
          }

          // Deduplication: If the syncToken doesn't match, a newer update exists
          if (cart.syncToken !== syncToken) {
            channel.ack(msg);
            return;
          }

          // Synchronize to MongoDB using existing update method
          // The updateByUserId method updates MongoDB.
          let { syncToken: token, ...newCart } = cart;
          await updateById(cart._id, newCart);
          channel.ack(msg);
        } catch (error) {
          // Reject message. It will be re-queued or dropped depending on existing config.
          // Since we want standard retry, we can reject with requeue=false (if DLX is set up for errors)
          // or requeue=true for immediate retry. Let's requeue for now.
          channel.reject(msg, true);
        }
      }
    },
    {
      noAck: false,
    },
  );
}

module.exports = {
  startCartConsumer,
};
