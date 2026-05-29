const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const env = require("../config/env");

const embeddingsModel = new GoogleGenerativeAIEmbeddings({
  apiKey: env.geminiApiKey,
  modelName: env.embeddingModel,
});

const createEmbeddings = async (texts) => {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  if (!env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is required to generate embeddings.");
  }

  const embeddings = await embeddingsModel.embedDocuments(texts);
  return embeddings;
};

module.exports = {
  createEmbeddings
};
