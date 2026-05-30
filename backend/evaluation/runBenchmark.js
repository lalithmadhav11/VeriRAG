const fs = require("fs");
const path = require("path");
const { createEmbeddings } = require("../src/services/embedding.service");
const { splitIntoSentences, cosineSimilarity } = require("../src/utils/math");
const { hallucScorer } = require("../src/agent/tools/hallucScorer");
const {
  calculateConfusionMatrix,
  calculateAccuracy,
  calculatePrecision,
  calculateRecall,
  calculateF1
} = require("./metrics");

const datasetPath = path.join(__dirname, "dataset.json");

const runBenchmark = async () => {
  console.log("Loading dataset...");
  const rawData = fs.readFileSync(datasetPath, "utf-8");
  const dataset = JSON.parse(rawData);
  
  console.log(`Starting benchmark for ${dataset.length} samples...`);
  
  const predictions = [];

  for (let i = 0; i < dataset.length; i++) {
    const { id, context, answer, expected } = dataset[i];
    
    // Split context into semantic chunks
    const chunks = splitIntoSentences(context);
    
    try {
      // Generate embeddings for the answer and all context chunks
      // We pass them all as an array to embedding.service.js
      const textsToEmbed = [answer, ...chunks];
      const embeddings = await createEmbeddings(textsToEmbed);
      
      const answerEmbedding = embeddings[0];
      const chunkEmbeddings = embeddings.slice(1);
      
      // Calculate maxSim and avgSim based on chunk similarities
      const similarities = chunkEmbeddings.map(chunkEmb => 
        cosineSimilarity(answerEmbedding, chunkEmb)
      );
      
      const maxSim = Math.max(...similarities);
      const avgSim = similarities.reduce((acc, val) => acc + val, 0) / similarities.length;
      
      // Predict hallucination state
      const { score, flagged } = hallucScorer({ maxSim, avgSim });
      const predicted = flagged ? "hallucinated" : "grounded";
      
      predictions.push({
        id,
        expected,
        predicted,
        score,
        maxSim,
        avgSim
      });
      
      process.stdout.write(`.`); // Progress indicator
    } catch (error) {
      console.error(`\nError processing sample ${id}:`, error.message);
    }
  }

  console.log("\n\nCalculating metrics...");

  const { tp, tn, fp, fn } = calculateConfusionMatrix(predictions);
  const accuracy = calculateAccuracy(tp, tn, fp, fn);
  const precision = calculatePrecision(tp, fp);
  const recall = calculateRecall(tp, fn);
  const f1 = calculateF1(precision, recall);

  console.log("\nVERIRAG BENCHMARK RESULTS\n");
  console.log(`Samples: ${predictions.length}\n`);
  console.log(`Accuracy: ${(accuracy * 100).toFixed(0)}%`);
  console.log(`Precision: ${(precision * 100).toFixed(0)}%`);
  console.log(`Recall: ${(recall * 100).toFixed(0)}%`);
  console.log(`F1 Score: ${(f1 * 100).toFixed(0)}%\n`);
  
  console.log("Confusion Matrix\n");
  console.log(`TP: ${tp}`);
  console.log(`TN: ${tn}`);
  console.log(`FP: ${fp}`);
  console.log(`FN: ${fn}\n`);
};

runBenchmark().catch(console.error);
