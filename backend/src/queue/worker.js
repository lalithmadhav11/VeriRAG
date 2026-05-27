const { Worker } = require("bullmq");
const { redisConnection } = require("./connection");
const { QUEUE_NAME } = require("./producer");
const { runAgent } = require("../agent/graph");
const QueryHistory = require("../models/QueryHistory");
const env = require("../config/env");
const { logger } = require("../utils/logger");

// How many jobs to run in parallel per worker process.
const WORKER_CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 3);

const processQueryJob = async (job) => {
  const { jobId, query } = job.data;

  // Mark as processing on first attempt so the poll endpoint reflects live state.
  await QueryHistory.findOneAndUpdate(
    { jobId },
    { status: "processing", attempts: job.attemptsMade + 1 },
    { new: true }
  );

  const startTime = process.hrtime.bigint();

  // Run the full LangGraph agent pipeline.
  const result = await runAgent(query);

  const endTime = process.hrtime.bigint();
  const durationMs = Number(endTime - startTime) / 1_000_000;

  // Persist the completed result to Mongo for polling.
  await QueryHistory.findOneAndUpdate(
    { jobId },
    {
      status: "completed",
      answer: result.answer || "",
      hallucinationScore: result.hallucinationScore ?? null,
      flagged: result.flagged ?? false,
      usedWebFallback: result.usedWebFallback ?? false,
      finalSources: result.finalSources || [],
      attempts: job.attemptsMade + 1,
      errorMessage: null
    },
    { new: true }
  );

  // Return value is stored in BullMQ job.returnvalue for optional direct reads.
  return {
    answer: result.answer,
    hallucinationScore: result.hallucinationScore,
    flagged: result.flagged,
    usedWebFallback: result.usedWebFallback,
    durationMs
  };
};

const createWorker = () => {
  const worker = new Worker(QUEUE_NAME, processQueryJob, {
    connection: redisConnection,
    concurrency: WORKER_CONCURRENCY
  });

  worker.on("active", (job) => {
    logger.info("Worker job started", {
      jobId: job.id,
      attempt: job.attemptsMade + 1,
      maxAttempts: env.jobMaxAttempts
    });
  });

  worker.on("completed", (job, result) => {
    logger.info("Worker job completed", { 
      jobId: job.id, 
      durationMs: result.durationMs,
      flagged: result.flagged
    });
  });

  worker.on("failed", async (job, error) => {
    // job is undefined when the job itself couldn't be deserialized.
    if (!job) {
      logger.error("Worker unknown job failed", { error: error.message });
      return;
    }

    const isFinalAttempt = job.attemptsMade >= env.jobMaxAttempts;
    logger.error("Worker job failed", {
      jobId: job.id,
      attempt: job.attemptsMade,
      maxAttempts: env.jobMaxAttempts,
      error: error.message
    });

    // Only write the failed terminal state after all retries are exhausted.
    if (isFinalAttempt) {
      await QueryHistory.findOneAndUpdate(
        { jobId: job.id },
        {
          status: "failed",
          errorMessage: error.message,
          attempts: job.attemptsMade
        }
      );
    }
  });

  worker.on("error", (error) => {
    logger.error("Worker runtime error", { error: error.message });
  });

  worker.on("stalled", (jobId) => {
    logger.warn("Worker job stalled (will be retried)", { jobId });
  });

  return worker;
};

module.exports = {
  createWorker
};
