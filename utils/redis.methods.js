const redis = require("../config/redis.config");

// method to cache payload in redis memeory
exports.cacheRedis = async (key, payload, expirationTime) => {
  await redis.set(key, JSON.stringify(payload), "EX", expirationTime);
};
