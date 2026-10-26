const { getChannel } = require("../config/rabbitmq");
const { CART_EXCHANGE } = require("../rabbitmq/exchanges");

function publishCartSync(userId, syncToken) {
  const channel = getChannel();
  const expirationSeconds = Number(process.env.Redis_Expriation_Time) || 604800;
  const delayMs = Math.max(0, (expirationSeconds - 180) * 1000);

  return channel.publish(
    CART_EXCHANGE,
    "cart.delay",
    Buffer.from(JSON.stringify({ userId: String(userId), syncToken })),
    {
      persistent: true,
      contentType: "application/json",
      expiration: String(delayMs),
    },
  );
}

function publishCartDelete(userId) {
  const channel = getChannel();
  return channel.publish(
    CART_EXCHANGE,
    "cart.delete",
    Buffer.from(JSON.stringify({ userId: String(userId) })),
    { persistent: true, contentType: "application/json" },
  );
}

module.exports = { publishCartSync, publishCartDelete };
