const OpenAI = require("openai");
const env = require("../config/env");

const openai = new OpenAI({
  apiKey: env.openAiApiKey
});

const createEmbeddings = async (texts) => {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  if (!env.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is required to generate embeddings.");
  }

  const response = await openai.embeddings.create({
    model: env.embeddingModel,
    input: texts
  });

  return response.data.map((item) => item.embedding);
};

module.exports = {
  createEmbeddings
};
