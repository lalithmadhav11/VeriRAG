const routerNode = async (state) => {
  const query = state.query || "";
  const lowered = query.toLowerCase();

  // Route to web search first for time-sensitive/current-events questions.
  const needsWebFirst =
    lowered.includes("latest") ||
    lowered.includes("current") ||
    lowered.includes("today") ||
    lowered.includes("news") ||
    lowered.includes("breaking");

  return {
    route: needsWebFirst ? "webSearch" : "retriever"
  };
};

module.exports = {
  routerNode
};
