const { randomUUID } = require("crypto");
const QueryHistory = require("../../models/QueryHistory");
const { enqueueQueryJob } = require("../../queue/producer");

// POST /api/query/async
// Enqueues a RAG query job and returns a jobId for polling.
const submitQueryController = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "query field (string) is required." });
    }

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
  } catch (error) {
    return next(error);
  }
};

// GET /api/query/status/:jobId
// Polls Mongo for the latest job result. Does not depend on Redis.
const queryStatusController = async (req, res, next) => {
  try {
    const { jobId } = req.params;

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
  } catch (error) {
    return next(error);
  }
};

// GET /api/query/history?page=1&limit=20
// Returns paginated query history ordered by most recent first.
const queryHistoryController = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
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
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitQueryController,
  queryStatusController,
  queryHistoryController
};
