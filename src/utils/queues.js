const { Queue } = require("bullmq");
const redis = require("../config/redis.config");

// queue of cart
exports.cartQueue = new Queue("cart-queue", { connection: redis });

exports.saveCartJob = async (userId) => {
  /* function to add/override a background job
  to save cart in DB before expiration in redis cache*/
  await this.cartQueue.add(
    "save-cart",
    { userId },
    {
      jobId: `cart-save-${userId}`,
      delay: (Number(process.env.Redis_Expriation_Time) - 3 * 60) * 1000,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
};
