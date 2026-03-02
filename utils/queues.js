const { Queue } = require("bullmq");
const redis = require("../config/redis.config");

// queue of cart
exports.cartQueue = new Queue("cart-queue", { connection: redis });
