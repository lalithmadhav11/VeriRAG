const IORedis = require("ioredis");
const env = require("../config/env");

// BullMQ requires a shared IORedis connection rather than the built-in client
// so that Queue, Worker, and QueueEvents can reuse the same socket pool.
const redisConnection = new IORedis({
  host: env.redisHost,
  port: env.redisPort,
  password: env.redisPassword,
  // Prevent ioredis from crashing the process on connection loss.
  // BullMQ handles reconnection internally.
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redisConnection.on("connect", () => {
  console.log("[REDIS] Connected");
});

redisConnection.on("error", (error) => {
  console.error("[REDIS_ERROR]", error.message);
});

module.exports = {
  redisConnection
};
