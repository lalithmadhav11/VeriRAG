const { hallucScorer } = require("../tools/hallucScorer");

const validatorNode = async (state) => {
  const { maxSim, avgSim } = state.retrievalStats || { maxSim: 0, avgSim: 0 };
  const { score, flagged } = hallucScorer({ maxSim, avgSim });

  return {
    hallucinationScore: score,
    flagged
  };
};

module.exports = {
  validatorNode
};
