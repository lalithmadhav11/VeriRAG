const mongoose = require("mongoose");

const queryHistorySchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    query: {
      type: String,
      required: true
    },
    // Lifecycle: pending -> processing -> completed | failed
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true
    },
    answer: {
      type: String,
      default: null
    },
    hallucinationScore: {
      type: Number,
      default: null
    },
    flagged: {
      type: Boolean,
      default: false
    },
    usedWebFallback: {
      type: Boolean,
      default: false
    },
    finalSources: {
      type: [String],
      default: []
    },
    // Number of attempts made by BullMQ before success or final failure.
    attempts: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("QueryHistory", queryHistorySchema);
