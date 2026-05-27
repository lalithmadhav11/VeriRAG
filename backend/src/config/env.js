const dotenv = require("dotenv");
const { cleanEnv, str, port, num, url } = require("envalid");

dotenv.config();

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "production", "test"], default: "development" }),
  PORT: port({ default: 8080 }),
  FRONTEND_URL: str({ default: "http://localhost:5173", desc: "Allowed CORS origin" }),
  
  MONGODB_URI: url({ default: "mongodb://localhost:27017/verirag", desc: "MongoDB Connection String" }),
  
  CHROMA_URL: url({ default: "http://localhost:8000" }),
  CHROMA_COLLECTION: str({ default: "rag_firewall_docs" }),
  
  OPENAI_API_KEY: str({ desc: "OpenAI API Key for Embeddings and LLM" }),
  
  SLACK_BOT_TOKEN: str({ default: "", desc: "Optional Slack integration token" }),
  SLACK_SIGNING_SECRET: str({ default: "", desc: "Optional Slack signing secret" }),
  
  EMBEDDING_MODEL: str({ default: "text-embedding-3-small" }),
  MAX_CHUNK_SIZE: num({ default: 900 }),
  CHUNK_OVERLAP: num({ default: 150 }),
  
  REDIS_HOST: str({ default: "localhost" }),
  REDIS_PORT: port({ default: 6379 }),
  REDIS_PASSWORD: str({ default: "", desc: "Optional Redis password" }),
  
  JOB_MAX_ATTEMPTS: num({ default: 4 })
});

module.exports = {
  isProduction: env.NODE_ENV === 'production',
  port: env.PORT,
  frontendUrl: env.FRONTEND_URL,
  mongodbUri: env.MONGODB_URI,
  chromaUrl: env.CHROMA_URL,
  chromaCollection: env.CHROMA_COLLECTION,
  openAiApiKey: env.OPENAI_API_KEY,
  slackBotToken: env.SLACK_BOT_TOKEN,
  slackSigningSecret: env.SLACK_SIGNING_SECRET,
  embeddingModel: env.EMBEDDING_MODEL,
  maxChunkSize: env.MAX_CHUNK_SIZE,
  chunkOverlap: env.CHUNK_OVERLAP,
  redisHost: env.REDIS_HOST,
  redisPort: env.REDIS_PORT,
  redisPassword: env.REDIS_PASSWORD,
  jobMaxAttempts: env.JOB_MAX_ATTEMPTS
};
