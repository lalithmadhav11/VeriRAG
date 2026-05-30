const { cosineSimilarity, normalizeEmbedding, splitIntoSentences } = require("../src/utils/math");

describe("Math Utilities", () => {
  describe("cosineSimilarity", () => {
    it("should return 1 for identical vectors", () => {
      expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1.0);
    });

    it("should return 0 for orthogonal vectors", () => {
      expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0);
    });

    it("should return -1 for opposite vectors", () => {
      expect(cosineSimilarity([1, 2, 3], [-1, -2, -3])).toBeCloseTo(-1.0);
    });

    it("should throw an error for mismatched vector lengths", () => {
      expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow("Vectors must have the same length");
    });

    it("should return 0 if one vector is all zeros", () => {
      expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    });
  });

  describe("normalizeEmbedding", () => {
    it("should normalize a vector to length 1", () => {
      const vec = [3, 4]; // Length is 5
      const normalized = normalizeEmbedding(vec);
      expect(normalized[0]).toBeCloseTo(0.6);
      expect(normalized[1]).toBeCloseTo(0.8);
    });

    it("should return the same vector if it is all zeros", () => {
      const vec = [0, 0, 0];
      expect(normalizeEmbedding(vec)).toEqual([0, 0, 0]);
    });
  });

  describe("splitIntoSentences", () => {
    it("should split text into individual sentences", () => {
      const text = "This is the first sentence. Is this the second? Yes it is!";
      const chunks = splitIntoSentences(text);
      expect(chunks).toEqual([
        "This is the first sentence.",
        "Is this the second?",
        "Yes it is!"
      ]);
    });

    it("should handle text without punctuation gracefully", () => {
      const text = "This is a single sentence without punctuation";
      expect(splitIntoSentences(text)).toEqual(["This is a single sentence without punctuation"]);
    });

    it("should return empty array for empty string", () => {
      expect(splitIntoSentences("")).toEqual([]);
    });
  });
});
