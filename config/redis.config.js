const Redis = require("redis");

const redisClient = Redis.createClient({
  url: "redis://127.0.0.1:6379", 
});

// event emitters for redis //
redisClient.on("connect", () => {
  console.log("Redis Connected Successfully!");
});

redisClient.on("error", (error) => {
  console.log(`Redis Error:${error}`);
  console.error(error);
});

(async () => await redisClient.connect())();

module.exports = redisClient;

// redis://username:password@host:port
