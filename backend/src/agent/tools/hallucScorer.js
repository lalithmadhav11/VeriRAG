const hallucScorer = ({ maxSim = 0, avgSim = 0 }) => {
  // Required formula:
  // score = (maxSim * 0.7) + (avgSim * 0.3)
  const score = maxSim * 0.7 + avgSim * 0.3;
  const flagged = maxSim < 0.75;

  return {
    score,
    flagged
  };
};

module.exports = {
  hallucScorer
};
