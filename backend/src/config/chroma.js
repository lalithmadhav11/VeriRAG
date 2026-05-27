const { ChromaClient } = require("chromadb");
const env = require("./env");

const client = new ChromaClient({
  path: env.chromaUrl
});

const getOrCreateCollection = async () => {
  // Collection is created once and reused for all document chunks.
  return client.getOrCreateCollection({
    name: env.chromaCollection,
    metadata: { purpose: "rag-hallucination-firewall" }
  });
};

module.exports = {
  chromaClient: client,
  getOrCreateCollection
};
