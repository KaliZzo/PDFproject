// routes/pdfRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const { processPDF } = require("../controllers/pdfController");
const { initPinecone } = require("../utils/vectorDatabase");

router.post("/process", async (req, res) => {
  try {
    // אתחול Pinecone

    // נתיב לקובץ ה-PDF
    const pdfPath = path.join(
      __dirname,
      "../data/Toyota corolla Manual 2020.pdf"
    );

    // עיבוד ה-PDF
    await processPDF(pdfPath);

    res.status(200).json({ message: "PDF processed successfully." });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Error processing PDF" });
  }
});

module.exports = router;
