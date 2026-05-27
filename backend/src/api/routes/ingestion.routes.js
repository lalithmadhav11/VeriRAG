const express = require("express");
const multer = require("multer");
const { ingestPdfController } = require("../controllers/ingestion.controller");

const router = express.Router();

// Use in-memory upload for direct pipeline processing.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }
});

router.post("/pdf", upload.single("file"), ingestPdfController);

module.exports = router;
