const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    sourceName: {
      type: String,
      required: true,
      trim: true
    },
    originalFilename: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    chunkCount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["indexed", "failed"],
      default: "indexed"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Document", documentSchema);
