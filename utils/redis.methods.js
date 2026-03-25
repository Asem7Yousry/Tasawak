const redis = require("../config/redis.config");

// method to cache payload in redis memeory
exports.cacheRedis = async (
  key,
  payload,
  expirationTime = Number(process.env.Redis_Expriation_Time),
) => {
  await redis.set(key, JSON.stringify(payload), "EX", expirationTime);
};

// method to delete cache
exports.delCache = async (key) => await redis.del(key);

// get cached data
exports.getCache = async (key) => {
  let data = await redis.get(key);
  return JSON.parse(data);
};
