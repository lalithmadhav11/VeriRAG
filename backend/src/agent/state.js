const { Annotation } = require("@langchain/langgraph");

// Shared graph state for all nodes.
const AgentState = Annotation.Root({
  query: Annotation({
    reducer: (_prev, next) => next,
    default: () => ""
  }),
  route: Annotation({
    reducer: (_prev, next) => next,
    default: () => "retriever"
  }),
  retrievedChunks: Annotation({
    reducer: (_prev, next) => next,
    default: () => []
  }),
  retrievalStats: Annotation({
    reducer: (_prev, next) => next,
    default: () => ({ maxSim: 0, avgSim: 0 })
  }),
  webResults: Annotation({
    reducer: (_prev, next) => next,
    default: () => []
  }),
  answer: Annotation({
    reducer: (_prev, next) => next,
    default: () => ""
  }),
  hallucinationScore: Annotation({
    reducer: (_prev, next) => next,
    default: () => 0
  }),
  flagged: Annotation({
    reducer: (_prev, next) => next,
    default: () => false
  }),
  usedWebFallback: Annotation({
    reducer: (_prev, next) => next,
    default: () => false
  }),
  finalSources: Annotation({
    reducer: (_prev, next) => next,
    default: () => []
  })
});

module.exports = {
  AgentState
};
