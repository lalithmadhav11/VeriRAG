const test = require("node:test");
const assert = require("node:assert/strict");
const { hallucScorer } = require("../src/agent/tools/hallucScorer");

test("hallucScorer applies weighted formula", () => {
  const result = hallucScorer({ maxSim: 0.8, avgSim: 0.5 });
  assert.equal(result.score, 0.71);
  assert.equal(result.flagged, false);
});

test("hallucScorer flags low max similarity", () => {
  const result = hallucScorer({ maxSim: 0.7, avgSim: 0.95 });
  assert.equal(result.flagged, true);
});
