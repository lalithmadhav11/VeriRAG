const { vectorSearch } = require("../tools/vectorSearch");

const retrieverNode = async (state) => {
  const hits = await vectorSearch({
    query: state.query,
    topK: 5
  });

  const similarities = hits.map((item) => item.similarity);
  const maxSim = similarities.length ? Math.max(...similarities) : 0;
  const avgSim = similarities.length
    ? similarities.reduce((acc, curr) => acc + curr, 0) / similarities.length
    : 0;

  return {
    retrievedChunks: hits,
    retrievalStats: { maxSim, avgSim },
    finalSources: hits.map((hit) => hit.metadata?.originalFilename || "vector-store")
  };
};

module.exports = {
  retrieverNode
};
