/**
 * Calculates the cosine similarity between two vectors.
 * 
 * @param {number[]} vecA - The first vector.
 * @param {number[]} vecB - The second vector.
 * @returns {number} The cosine similarity score (-1 to 1).
 */
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0; // Prevent division by zero
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Normalizes a given vector to have a magnitude of 1.
 * 
 * @param {number[]} vec - The vector to normalize.
 * @returns {number[]} The normalized vector.
 */
const normalizeEmbedding = (vec) => {
  let norm = 0;
  for (let i = 0; i < vec.length; i++) {
    norm += vec[i] * vec[i];
  }
  
  norm = Math.sqrt(norm);
  
  if (norm === 0) return vec;
  
  return vec.map((val) => val / norm);
};

/**
 * Splits a text into semantic chunks based on sentence boundaries.
 * 
 * @param {string} text - The text to split.
 * @returns {string[]} An array of sentences.
 */
const splitIntoSentences = (text) => {
  if (!text) return [];
  // Match period, exclamation, or question mark followed by a space or end of string.
  return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [text.trim()];
};

module.exports = {
  cosineSimilarity,
  normalizeEmbedding,
  splitIntoSentences
};
