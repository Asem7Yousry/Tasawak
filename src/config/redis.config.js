require("dotenv").config();
const IORedis = require("ioredis");

const redis = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis Cloud connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redis;

