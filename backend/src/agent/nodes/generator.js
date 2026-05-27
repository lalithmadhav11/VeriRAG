const { ChatOpenAI } = require("@langchain/openai");
const env = require("../../config/env");

const llm = new ChatOpenAI({
  apiKey: env.openAiApiKey,
  model: "gpt-4o-mini",
  temperature: 0.1
});

const generatorNode = async (state) => {
  const vectorContext = (state.retrievedChunks || [])
    .map((chunk, index) => `[V${index + 1}] ${chunk.content}`)
    .join("\n\n");

  const webContext = (state.webResults || [])
    .map((item, index) => `[W${index + 1}] ${item.content} (source: ${item.url})`)
    .join("\n\n");

  const contextBlock = [vectorContext, webContext].filter(Boolean).join("\n\n");

  const prompt = [
    "You are a RAG answer generator.",
    "Use only the supplied context. If context is insufficient, say so clearly.",
    `Question: ${state.query}`,
    "",
    "Context:",
    contextBlock || "No context available."
  ].join("\n");

  const response = await llm.invoke(prompt);
  const answerText =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  return {
    answer: answerText
  };
};

module.exports = {
  generatorNode
};
