const redis = require("../config/redis.config");

// method to cache payload in redis memeory
exports.cacheRedis = async (key, payload, expirationTime) => {
  await redis.set(key, JSON.stringify(payload), "EX", expirationTime);
};

// method to delete cache
exports.delCache = async (key) => await redis.del(key);

// get cached data
exports.getCache = async (key) => await redis.get(key);
