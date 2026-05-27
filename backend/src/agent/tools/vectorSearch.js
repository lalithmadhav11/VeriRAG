const { createEmbeddings } = require("../../services/embedding.service");
const { searchChunks } = require("../../services/chroma.service");

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const vectorSearch = async ({ query, topK = 5 }) => {
  const [queryEmbedding] = await createEmbeddings([query]);
  const rawResults = await searchChunks({
    queryEmbedding,
    topK
  });

  // Convert distance to a similarity-like score in [0, 1].
  const normalizedResults = rawResults.map((hit) => {
    const distance = typeof hit.distance === "number" ? hit.distance : 1;
    const similarity = clamp01(1 - distance);
    return {
      ...hit,
      similarity
    };
  });

  return normalizedResults;
};

module.exports = {
  vectorSearch
};
