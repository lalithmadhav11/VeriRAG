const { randomUUID } = require("crypto");
const { z } = require("zod");
const QueryHistory = require("../../models/QueryHistory");
const { enqueueQueryJob } = require("../../queue/producer");
const { asyncHandler } = require("../../utils/asyncHandler");

const submitQuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty").max(2000, "Query too long")
});

const statusQuerySchema = z.object({
  jobId: z.string().uuid("Invalid Job ID format")
});

const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

// POST /api/query/async
// Enqueues a RAG query job and returns a jobId for polling.
const submitQueryController = asyncHandler(async (req, res) => {
  const { query } = submitQuerySchema.parse(req.body);

  const jobId = randomUUID();

  // Persist an initial record immediately so /status can return "pending"
  // even before the worker picks up the job.
  await QueryHistory.create({ jobId, query, status: "pending" });

  await enqueueQueryJob({ jobId, query });

  return res.status(202).json({
    message: "Query accepted and queued for processing.",
    jobId,
    statusUrl: `/api/query/status/${jobId}`
  });
});

// GET /api/query/status/:jobId
// Polls Mongo for the latest job result. Does not depend on Redis.
const queryStatusController = asyncHandler(async (req, res) => {
  const { jobId } = statusQuerySchema.parse(req.params);

  const record = await QueryHistory.findOne({ jobId }).lean();

  if (!record) {
    return res.status(404).json({ error: "Job not found." });
  }

  if (record.status === "pending" || record.status === "processing") {
    return res.status(202).json({
      jobId,
      status: record.status,
      message: "Job is still being processed."
    });
  }

  if (record.status === "failed") {
    return res.status(200).json({
      jobId,
      status: "failed",
      error: record.errorMessage,
      attempts: record.attempts
    });
  }

  // status === "completed"
  return res.status(200).json({
    jobId,
    status: "completed",
    query: record.query,
    answer: record.answer,
    hallucinationScore: record.hallucinationScore,
    flagged: record.flagged,
    usedWebFallback: record.usedWebFallback,
    finalSources: record.finalSources,
    completedAt: record.updatedAt
  });
});

// GET /api/query/history?page=1&limit=20
// Returns paginated query history ordered by most recent first.
const queryHistoryController = asyncHandler(async (req, res) => {
  const { page, limit } = historyQuerySchema.parse(req.query);
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    QueryHistory.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    QueryHistory.countDocuments()
  ]);

  return res.status(200).json({
    page,
    limit,
    total,
    records
  });
});

module.exports = {
  submitQueryController,
  queryStatusController,
  queryHistoryController
};
