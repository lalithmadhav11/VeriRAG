const { TavilySearchResults } = require("@langchain/community/tools/tavily_search");
const env = require("../../config/env");

const webFallback = async ({ query, maxResults = 5 }) => {
  if (!env.tavilyApiKey) {
    return [];
  }

  const tool = new TavilySearchResults({
    apiKey: env.tavilyApiKey,
    maxResults
  });

  const response = await tool.invoke({
    query
  });

  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response === "string") {
    try {
      return JSON.parse(response);
    } catch (_error) {
      return [{ content: response, url: "unknown" }];
    }
  }

  return [];
};

module.exports = {
  webFallback
};
