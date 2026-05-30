# Hallucination Validation Benchmark Report

## Evaluation Methodology

This benchmark evaluates the effectiveness of VeriRAG's mathematical hallucination detection algorithm. The test assesses how well the system can differentiate between a "grounded" response (factually supported by the retrieved context) and a "hallucinated" response (fabricated facts, semantic drift, or incorrect entities).

### Dataset Design
The dataset consists of **50 handcrafted examples** tailored to enterprise AI infrastructure knowledge (e.g., Redis, BullMQ, ChromaDB, LangGraph, MongoDB). 
- **25 Grounded Examples**: The answer is semantically aligned and factually supported by the context.
- **25 Hallucinated Examples**: The answer introduces fabricated concepts, conflicting facts, or entirely un-related conclusions.

### Scoring Formula
The evaluation utilizes the core mathematical algorithm employed by the `hallucScorer.js` tool:

```javascript
score = (maxSim * 0.7) + (avgSim * 0.3)
```

To accurately simulate production retrieval metrics:
1. The **Context** is split into semantic chunks based on sentence boundaries.
2. The **Answer** and each **Context Chunk** are mapped to dense vector space using Google Gemini's `gemini-embedding-2` model.
3. `maxSim` represents the highest cosine similarity between the Answer and any single Context chunk.
4. `avgSim` represents the average cosine similarity across all Context chunks.

### Threshold Selection
The benchmark uses a strict threshold of `0.75`. If the final `score` falls below `0.75`, the response is flagged as **Hallucinated**. Otherwise, it is classified as **Grounded**.

---

## Results

| Metric | Score | Explanation |
| :--- | :--- | :--- |
| **Accuracy** | 62% | Overall percentage of correct classifications. |
| **Precision** | 88% | Of the answers flagged as hallucinations, 88% were actual hallucinations (Very few false alarms). |
| **Recall** | 28% | The system only caught 28% of the total actual hallucinations. |
| **F1 Score** | 42% | The harmonic mean of precision and recall. |

### Confusion Matrix
- **True Positives (TP): 7** (Correctly caught hallucinations)
- **True Negatives (TN): 24** (Correctly permitted grounded answers)
- **False Positives (FP): 1** (Incorrectly flagged a grounded answer)
- **False Negatives (FN): 18** (Missed hallucinations that slipped through)

---

## Limitations

1. **High False Negative Rate**: The system missed 18 hallucinations. This occurs because modern dense embeddings (like Gemini's) are highly adept at capturing thematic overlap. A hallucination that uses the same vocabulary and discusses the same topic (e.g., "BullMQ is a MongoDB ORM") still generates a high vector similarity to the context ("BullMQ is a Redis queue"), slipping past the `0.75` threshold.
2. **Context Length**: The dataset examples are extremely short. In production, larger contexts may dilute the `avgSim` score, potentially increasing Recall.

## Future Improvements

1. **Dynamic Thresholding**: Adjusting the `0.75` threshold dynamically based on the embedding variance.
2. **Hybrid Validation**: Combining cosine similarity scoring with an LLM-as-a-judge node to catch thematic hallucinations that mathematically resemble grounded text.
3. **Keyword Penalties**: Introducing a sparse BM25 penalty for critical entity mismatch (e.g., if "MongoDB" is in the answer but not the context).
