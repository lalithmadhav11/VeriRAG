const { START, END, StateGraph } = require("@langchain/langgraph");
const { AgentState } = require("./state");
const { routerNode } = require("./nodes/router");
const { retrieverNode } = require("./nodes/retriever");
const { webSearchNode } = require("./nodes/webSearch");
const { generatorNode } = require("./nodes/generator");
const { validatorNode } = require("./nodes/validator");

const workflow = new StateGraph(AgentState)
  .addNode("router", routerNode)
  .addNode("retriever", retrieverNode)
  .addNode("webSearch", webSearchNode)
  .addNode("generator", generatorNode)
  .addNode("validator", validatorNode)
  .addEdge(START, "router")
  .addConditionalEdges("router", (state) => {
    return state.route === "webSearch" ? "webSearch" : "retriever";
  })
  .addEdge("retriever", "generator")
  .addEdge("webSearch", "generator")
  .addEdge("generator", "validator")
  .addConditionalEdges("validator", (state) => {
    // If retrieval confidence is low and web fallback wasn't used yet,
    // route to web search to enrich context and regenerate once.
    if (state.flagged && !state.usedWebFallback) {
      return "webSearch";
    }
    return END;
  });

const agentGraph = workflow.compile();

const runAgent = async (query) => {
  const result = await agentGraph.invoke({
    query,
    route: "retriever",
    retrievedChunks: [],
    retrievalStats: { maxSim: 0, avgSim: 0 },
    webResults: [],
    answer: "",
    hallucinationScore: 0,
    flagged: false,
    usedWebFallback: false,
    finalSources: []
  });

  return result;
};

module.exports = {
  agentGraph,
  runAgent
};
