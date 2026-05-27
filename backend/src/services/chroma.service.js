const { getOrCreateCollection } = require("../config/chroma");

const indexChunks = async ({ ids, documents, embeddings, metadatas }) => {
  const collection = await getOrCreateCollection();
  await collection.upsert({
    ids,
    documents,
    embeddings,
    metadatas
  });
};

const searchChunks = async ({ queryEmbedding, topK = 5 }) => {
  const collection = await getOrCreateCollection();
  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK
  });

  const docs = result.documents?.[0] || [];
  const metas = result.metadatas?.[0] || [];
  const distances = result.distances?.[0] || [];

  return docs.map((content, index) => ({
    content,
    metadata: metas[index] || {},
    distance: distances[index]
  }));
};

module.exports = {
  indexChunks,
  searchChunks
};
