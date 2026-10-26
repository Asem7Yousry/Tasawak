const { getChannel } = require("../config/rabbitmq");
const { CART_MAIN_QUEUE, CART_DELETE_QUEUE } = require("../rabbitmq/queues");
const { updateById, checkCachedCart, deleteCart } = require("../services/cart.service");

async function startCartConsumer() {
  const channel = getChannel();
  channel.prefetch(1);

  await channel.consume(CART_MAIN_QUEUE, async (message) => {
    if (!message) return;
    try {
      const { userId, syncToken } = JSON.parse(message.content.toString());
      const cart = await checkCachedCart(userId);
      if (!cart || cart.syncToken !== syncToken) {
        channel.ack(message);
        return;
      }

      const { syncToken: ignoredSyncToken, ...cartData } = cart;
      await updateById(cart._id, cartData);
      channel.ack(message);
    } catch (error) {
      console.error("Failed to sync cart", error);
      channel.nack(message, false, true);
    }
  }, { noAck: false });

  await channel.consume(CART_DELETE_QUEUE, async (message) => {
    if (!message) return;
    try {
      const { userId } = JSON.parse(message.content.toString());
      if (!userId) throw new Error("Cart delete message is missing userId");
      await deleteCart(userId);
      channel.ack(message);
    } catch (error) {
      console.error("Failed to delete queued cart", error);
      channel.nack(message, false, true);
    }
  }, { noAck: false });
}

module.exports = { startCartConsumer };
