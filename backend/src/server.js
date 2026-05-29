const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const { connectMongo, mongoose } = require("./config/db");
const { getOrCreateCollection } = require("./config/chroma");
const { createWorker } = require("./queue/worker");
const { redisConnection } = require("./queue/connection");
const apiRouter = require("./api");
const { App, ExpressReceiver } = require("@slack/bolt");
const { registerSlackEvents } = require("./slack/events");
const { requestContext } = require("./middleware/requestContext.middleware");
const { logger } = require("./utils/logger");

const app = express();

// Security Headers & Payload Compression
app.use(helmet());
app.use(compression());

// Strict CORS (only allow explicitly configured frontend URL in production)
app.use(cors({
  origin: env.isProduction ? env.frontendUrl : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id"]
}));

// DDoS Protection: Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

app.use(requestContext);

// API Timeout Middleware (30s)
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    logger.error("Request timeout", { path: req.path, requestId: req.requestId });
    res.status(408).json({ error: "Request Timeout" });
  });
  next();
});

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
app.use((error, req, res, next) => {
  logger.error("Unhandled API error", { 
    error: error.message, 
    stack: error.stack,
    path: req.path,
    requestId: req.requestId
  });
  
  if (error.name === 'ZodError') {
    return res.status(400).json({ error: "Validation Error", details: error.errors });
  }

  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    error: (process.env.NODE_ENV === "production" && statusCode === 500) 
      ? "Internal server error" 
      : error.message
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
        logger.info("HTTP server closed.");
        try {
          await worker.close();
          logger.info("BullMQ worker closed.");
          await redisConnection.quit();
          logger.info("Redis connection closed.");
          await mongoose.disconnect();
          logger.info("MongoDB disconnected.");
        } catch (err) {
          logger.error("Error during graceful shutdown", { error: err.message });
        }
        process.exit(0);
      });
      // Force exit if shutdown stalls beyond 15 seconds.
      setTimeout(() => {
        logger.error("Graceful shutdown timed out, forcing exit.");
        process.exit(1);
      }, 15_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Startup error", { error: error.message });
    process.exit(1);
  }
};

startServer();
