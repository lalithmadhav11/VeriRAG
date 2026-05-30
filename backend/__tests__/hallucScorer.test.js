const { hallucScorer } = require("../src/agent/tools/hallucScorer");

describe("Hallucination Scorer", () => {
  it("should calculate score correctly for perfect similarity", () => {
    const { score, flagged } = hallucScorer({ maxSim: 1.0, avgSim: 1.0 });
    expect(score).toBeCloseTo(1.0);
    expect(flagged).toBe(false);
  });

  it("should calculate score correctly for zero similarity", () => {
    const { score, flagged } = hallucScorer({ maxSim: 0.0, avgSim: 0.0 });
    expect(score).toBeCloseTo(0.0);
    expect(flagged).toBe(true);
  });

  it("should classify correctly when just below threshold", () => {
    // maxSim = 0.74, score will be (0.74 * 0.7) + (0.74 * 0.3) = 0.74
    // flagged should be true because maxSim < 0.75
    const { score, flagged } = hallucScorer({ maxSim: 0.74, avgSim: 0.74 });
    expect(score).toBeCloseTo(0.74);
    expect(flagged).toBe(true);
  });

  it("should classify correctly when exactly at threshold", () => {
    // maxSim = 0.75 -> flagged = false
    const { score, flagged } = hallucScorer({ maxSim: 0.75, avgSim: 0.75 });
    expect(score).toBeCloseTo(0.75);
    expect(flagged).toBe(false);
  });

  it("should classify correctly for medium similarity where max is high but avg is low", () => {
    // maxSim = 0.8 (flagged = false), avgSim = 0.2
    // score = (0.8 * 0.7) + (0.2 * 0.3) = 0.56 + 0.06 = 0.62
    const { score, flagged } = hallucScorer({ maxSim: 0.8, avgSim: 0.2 });
    expect(score).toBeCloseTo(0.62);
    expect(flagged).toBe(false); 
  });

  it("should classify correctly for floating point precision cases", () => {
    const { score, flagged } = hallucScorer({ maxSim: 0.7499999, avgSim: 0.5 });
    expect(score).toBeCloseTo(0.7499999 * 0.7 + 0.5 * 0.3);
    expect(flagged).toBe(true);
  });

  it("should default to 0 if inputs are missing", () => {
    const { score, flagged } = hallucScorer({});
    expect(score).toBe(0);
    expect(flagged).toBe(true);
  });
});
