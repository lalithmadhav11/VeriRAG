const PDFParser = require("pdf2json");
const Document = require("../models/Document");
const env = require("../config/env");
const { recursiveChunkText } = require("../utils/chunker");
const { createEmbeddings } = require("../services/embedding.service");
const { indexChunks } = require("../services/chroma.service");

// Helper to extract text using pdf2json (handles bad XRef / corrupted PDFs better)
const extractTextFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);
    
    pdfParser.on("pdfParser_dataError", errData => {
      const error = new Error(`PDF Parsing failed: The file may be corrupted, encrypted, or unsupported.`);
      error.status = 400;
      reject(error);
    });
    pdfParser.on("pdfParser_dataReady", pdfData => {
      resolve(pdfParser.getRawTextContent());
    });
    
    pdfParser.parseBuffer(buffer);
  });
};

const ingestPdfBuffer = async ({ buffer, originalFilename, sourceName }) => {
  // 1) Extract raw text from PDF.
  const text = await extractTextFromBuffer(buffer);

  // 2) Recursively chunk text for retrieval quality.
  const chunks = recursiveChunkText(text, env.maxChunkSize, env.chunkOverlap);
  if (chunks.length === 0) {
    throw new Error("No textual content found in PDF.");
  }

  // 3) Generate embeddings in one batch request.
  const embeddings = await createEmbeddings(chunks);

  const documentRecord = await Document.create({
    sourceName,
    originalFilename,
    mimeType: "application/pdf",
    chunkCount: chunks.length,
    status: "indexed"
  });

  // 4) Index chunks to ChromaDB for semantic retrieval.
  const chunkIds = chunks.map((_, i) => `${documentRecord.id}_chunk_${i}`);
  const metadatas = chunks.map((_, i) => ({
    documentId: documentRecord.id,
    sourceName,
    originalFilename,
    chunkIndex: i
  }));

  await indexChunks({
    ids: chunkIds,
    documents: chunks,
    embeddings,
    metadatas
  });

  return {
    documentId: documentRecord.id,
    chunkCount: chunks.length
  };
};

module.exports = {
  ingestPdfBuffer
};
