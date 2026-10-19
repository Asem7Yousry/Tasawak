const { getChannel } = require("../config/rabbitmq");
const { CART_DELAY_EXCHANGE } = require("../rabbitmq/exchanges");

async function publishCartSync(userId, syncToken) {
  const channel = getChannel();

  const payload = {
    userId,
    syncToken,
  };

  // Delay by (Redis_Expriation_Time - 180 seconds)
  // If not provided in env, fallback to 7 days (604800s) minus 3 minutes (180s)
  const expirationTime = Number(process.env.Redis_Expriation_Time) || 604800;
  const delayMs = (expirationTime - 180) * 1000;
  const expiration = Math.max(0, delayMs).toString();

  channel.publish(
    CART_DELAY_EXCHANGE,
    "cart.delay",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
      expiration: expiration,
    },
  );
}

module.exports = {
  publishCartSync,
};
