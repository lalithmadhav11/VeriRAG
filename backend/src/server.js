const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const { connectMongo } = require("./config/db");
const { getOrCreateCollection } = require("./config/chroma");
const { createWorker } = require("./queue/worker");
const apiRouter = require("./api");
const { App, ExpressReceiver } = require("@slack/bolt");
const { registerSlackEvents } = require("./slack/events");
const { requestContext } = require("./middleware/requestContext.middleware");
const { logger } = require("./utils/logger");

const app = express();

app.use(cors());
app.use(requestContext);

// Important: mount Slack receiver BEFORE express.json(), otherwise Slack signature
// verification may fail due to the request body being pre-parsed.
if (env.slackBotToken && env.slackSigningSecret) {
  const receiver = new ExpressReceiver({
    signingSecret: env.slackSigningSecret,
    endpoints: "/slack/events"
  });

  const slackApp = new App({
    token: env.slackBotToken,
    receiver
  });

  registerSlackEvents(slackApp);

  // Mount Slack Bolt receiver into our Express server.
  app.use(slackApp.receiver.router);

  logger.info("Slack receiver mounted", { endpoint: "/slack/events" });
} else {
  logger.info("Slack integration disabled");
}

app.use(express.json({ limit: "5mb" }));

app.use("/api", apiRouter);

// Centralized error handler — keeps route handlers clean.
app.use((error, _req, res, _next) => {
  logger.error("Unhandled API error", { error: error.message });
  return res.status(500).json({
    error: error.message || "Internal server error"
  });
});

const startServer = async () => {
  try {
    await connectMongo();
    await getOrCreateCollection();

    // Start the BullMQ worker in the same process.
    // For high-throughput production deployments, run the worker as a
    // separate process/container via: node src/queue/worker.standalone.js
    const worker = createWorker();

    const server = app.listen(env.port, () => {
      logger.info("Backend started", { port: env.port });
    });

    // Graceful shutdown: drain in-flight jobs before exiting.
    const shutdown = async (signal) => {
      logger.info("Shutdown signal received", { signal });
      server.close(async () => {
        await worker.close();
        process.exit(0);
      });
      // Force exit if shutdown stalls beyond 15 seconds.
      setTimeout(() => process.exit(1), 15_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Startup error", { error: error.message });
    process.exit(1);
  }
};

startServer();
