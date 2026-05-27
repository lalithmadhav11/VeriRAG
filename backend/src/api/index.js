const express = require("express");
const ingestionRoutes = require("./routes/ingestion.routes");
const queryRoutes = require("./routes/query.routes");

const apiRouter = express.Router();

apiRouter.get("/health", async (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

apiRouter.use("/ingest", ingestionRoutes);
apiRouter.use("/query", queryRoutes);

module.exports = apiRouter;
