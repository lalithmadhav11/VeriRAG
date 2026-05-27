const { createEmbeddings } = require("../../services/embedding.service");
const { searchChunks } = require("../../services/chroma.service");

const queryController = async (req, res, next) => {
  try {
    const { query, topK } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query text is required." });
    }

    const [queryEmbedding] = await createEmbeddings([query]);
    const hits = await searchChunks({
      queryEmbedding,
      topK: Number(topK || 5)
    });

    return res.status(200).json({
      query,
      results: hits
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  queryController
};
