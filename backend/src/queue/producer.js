const { Queue } = require("bullmq");
const { redisConnection } = require("./connection");
const env = require("../config/env");

const QUEUE_NAME = "rag-query-pipeline";

const queryQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    // Keep the last 200 completed jobs for polling and audit.
    removeOnComplete: { count: 200 },
    // Keep the last 100 failed jobs for debugging.
    removeOnFail: { count: 100 },
    attempts: env.jobMaxAttempts,
    backoff: {
      // Exponential backoff: delay doubles on each retry.
      // Delay sequence: 2s, 4s, 8s, 16s ...
      type: "exponential",
      delay: 2000
    }
  }
});

const enqueueQueryJob = async ({ jobId, query }) => {
  const job = await queryQueue.add(
    "process-query",
    { jobId, query },
    {
      // Use caller-provided jobId so the HTTP layer can poll by it directly.
      jobId
    }
  );
  return job.id;
};

module.exports = {
  queryQueue,
  enqueueQueryJob,
  QUEUE_NAME
};
