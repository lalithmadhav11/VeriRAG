const { webFallback } = require("../tools/webFallback");

const webSearchNode = async (state) => {
  const results = await webFallback({
    query: state.query,
    maxResults: 5
  });

  const normalized = results.map((result) => ({
    content: result.content || result.snippet || JSON.stringify(result),
    url: result.url || result.link || "unknown"
  }));

  return {
    webResults: normalized,
    usedWebFallback: true,
    finalSources: normalized.map((item) => item.url)
  };
};

module.exports = {
  webSearchNode
};
