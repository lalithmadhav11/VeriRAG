const { validatorNode } = require("../src/agent/nodes/validator");
const { hallucScorer } = require("../src/agent/tools/hallucScorer");

// Mock the scorer so we only test the node routing logic
jest.mock("../src/agent/tools/hallucScorer");

describe("Validator Node Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct score and unflagged status when grounded", async () => {
    hallucScorer.mockReturnValue({ score: 0.85, flagged: false });

    const state = {
      retrievalStats: { maxSim: 0.9, avgSim: 0.8 }
    };

    const result = await validatorNode(state);
    
    expect(hallucScorer).toHaveBeenCalledWith({ maxSim: 0.9, avgSim: 0.8 });
    expect(result).toEqual({
      hallucinationScore: 0.85,
      flagged: false
    });
  });

  it("should return flagged status when hallucination detected", async () => {
    hallucScorer.mockReturnValue({ score: 0.45, flagged: true });

    const state = {
      retrievalStats: { maxSim: 0.5, avgSim: 0.4 }
    };

    const result = await validatorNode(state);
    
    expect(hallucScorer).toHaveBeenCalledWith({ maxSim: 0.5, avgSim: 0.4 });
    expect(result).toEqual({
      hallucinationScore: 0.45,
      flagged: true
    });
  });

  it("should handle missing retrievalStats gracefully", async () => {
    hallucScorer.mockReturnValue({ score: 0, flagged: true });

    const state = {};

    const result = await validatorNode(state);
    
    // Should default to 0 for maxSim and avgSim
    expect(hallucScorer).toHaveBeenCalledWith({ maxSim: 0, avgSim: 0 });
    expect(result).toEqual({
      hallucinationScore: 0,
      flagged: true
    });
  });
});
