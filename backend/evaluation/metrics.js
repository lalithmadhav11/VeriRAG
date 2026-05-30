/**
 * Computes confusion matrix components
 * @param {Array} predictions - Array of objects: { expected: 'grounded'|'hallucinated', predicted: 'grounded'|'hallucinated' }
 * @returns {Object} { tp, tn, fp, fn }
 */
const calculateConfusionMatrix = (predictions) => {
  let tp = 0; // True Positive (Correctly identified hallucination)
  let tn = 0; // True Negative (Correctly identified grounded)
  let fp = 0; // False Positive (Incorrectly identified grounded as hallucination)
  let fn = 0; // False Negative (Incorrectly identified hallucination as grounded)

  predictions.forEach(({ expected, predicted }) => {
    if (expected === 'hallucinated' && predicted === 'hallucinated') tp++;
    if (expected === 'grounded' && predicted === 'grounded') tn++;
    if (expected === 'grounded' && predicted === 'hallucinated') fp++;
    if (expected === 'hallucinated' && predicted === 'grounded') fn++;
  });

  return { tp, tn, fp, fn };
};

const calculateAccuracy = (tp, tn, fp, fn) => {
  const total = tp + tn + fp + fn;
  if (total === 0) return 0;
  return (tp + tn) / total;
};

const calculatePrecision = (tp, fp) => {
  if (tp + fp === 0) return 0;
  return tp / (tp + fp);
};

const calculateRecall = (tp, fn) => {
  if (tp + fn === 0) return 0;
  return tp / (tp + fn);
};

const calculateF1 = (precision, recall) => {
  if (precision + recall === 0) return 0;
  return 2 * ((precision * recall) / (precision + recall));
};

module.exports = {
  calculateConfusionMatrix,
  calculateAccuracy,
  calculatePrecision,
  calculateRecall,
  calculateF1
};
