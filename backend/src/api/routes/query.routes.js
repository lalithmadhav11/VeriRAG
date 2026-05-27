const express = require("express");
const { queryController } = require("../controllers/query.controller");
const {
  submitQueryController,
  queryStatusController,
  queryHistoryController
} = require("../controllers/asyncQuery.controller");

const router = express.Router();

// ── Synchronous (direct vector search, no agent) ──────────────────────────────
// POST /api/query
router.post("/", queryController);

// ── Async agent pipeline via BullMQ ──────────────────────────────────────────
// POST /api/query/async       → enqueue job, returns jobId
// GET  /api/query/status/:id  → poll result from Mongo
// GET  /api/query/history     → paginated history
router.post("/async", submitQueryController);
router.get("/status/:jobId", queryStatusController);
router.get("/history", queryHistoryController);

module.exports = router;
