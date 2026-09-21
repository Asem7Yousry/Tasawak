const { Worker } = require("bullmq");
const redis = require("../config/redis.config");
const { getCache } = require("./redis.methods");
const { updateById } = require("../services/cart.service");

// worker for cart saving in DB
new Worker(
  "cart-queue",
  async (job) => {
    const { userId } = job.data;
    let cart = await getCache(`cart_${userId}`);
    if (!cart) return;
    await updateById(cart._id, cart);
  },
  { connection: redis },
);
