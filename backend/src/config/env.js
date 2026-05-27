const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 8080),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/verirag",
  chromaUrl: process.env.CHROMA_URL || "http://localhost:8000",
  chromaCollection: process.env.CHROMA_COLLECTION || "rag_firewall_docs",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  tavilyApiKey: process.env.TAVILY_API_KEY || "",
  slackBotToken: process.env.SLACK_BOT_TOKEN || "",
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET || "",
  embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
  maxChunkSize: Number(process.env.MAX_CHUNK_SIZE || 900),
  chunkOverlap: Number(process.env.CHUNK_OVERLAP || 150),
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: Number(process.env.REDIS_PORT || 6379),
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  // Maximum times a failed job is retried before being moved to the failed set.
  jobMaxAttempts: Number(process.env.JOB_MAX_ATTEMPTS || 4)
};
