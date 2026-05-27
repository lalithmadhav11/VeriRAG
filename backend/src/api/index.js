const express = require("express");
const ingestionRoutes = require("./routes/ingestion.routes");
const queryRoutes = require("./routes/query.routes");

const apiRouter = express.Router();

const { mongoose } = require("../config/db");
const { redisConnection } = require("../queue/connection");

apiRouter.get("/health", async (req, res) => {
  try {
    const mongoState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisPing = await redisConnection.ping();
    
    return res.status(200).json({
      status: mongoState === 'connected' && redisPing === 'PONG' ? "ok" : "degraded",
      services: {
        mongo: mongoState,
        redis: redisPing === 'PONG' ? 'connected' : 'disconnected'
      },
      requestId: req.requestId,
      ts: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({
      status: "down",
      error: error.message,
      requestId: req.requestId,
      ts: new Date().toISOString()
    });
  }
});

apiRouter.use("/ingest", ingestionRoutes);
apiRouter.use("/query", queryRoutes);

module.exports = apiRouter;
