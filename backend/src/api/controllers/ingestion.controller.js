const { ingestPdfBuffer } = require("../../ingestion/pdfIngestion.pipeline");

const ingestPdfController = async (req, res, next) => {
  try {
    const file = req.file;
    const sourceName = req.body.sourceName || "default-source";

    if (!file) {
      return res.status(400).json({ error: "PDF file is required." });
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are supported." });
    }

    const result = await ingestPdfBuffer({
      buffer: file.buffer,
      originalFilename: file.originalname,
      sourceName
    });

    return res.status(201).json({
      message: "PDF ingested and indexed successfully.",
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  ingestPdfController
};
