const express = require("express");
const router = express.Router();
const path = require("path");
const { createEmbedding } = require("../controllers/embeddingController");
const { queryEmbeddings } = require("../utils/pineconeQuery"); // ייבוא מהקובץ החדש
const { getAnswerFromAI } = require("../controllers/openaiController");
const { extractPagesFromPDF } = require("../controllers/pdfController");

router.post("/", async (req, res) => {
  try {
    const question = req.body.question;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // יצירת Embedding לשאלה
    const questionEmbedding = await createEmbedding(question);

    // חיפוש מקטעים רלוונטיים
    const relevantSections = await queryEmbeddings(questionEmbedding, 5);

    if (!relevantSections || relevantSections.length === 0) {
      return res.status(404).json({ error: "No relevant sections found" });
    }

    // בניית ה-Prompt
    let prompt = "ענה על השאלה הבאה בהתבסס על המידע הנתון:\n\n";
    relevantSections.forEach((section) => {
      prompt += `עמוד ${section.metadata.pageNumber}:\n${section.metadata.text}\n\n`;
    });
    prompt += `שאלה: ${question}\nתשובה:`;

    // קבלת התשובה מ-OpenAI
    const answer = await getAnswerFromAI(prompt);

    // שליפת העמודים המקוריים
    const pageNumbers = relevantSections.map(
      (section) => section.metadata.pageNumber
    );
    const pdfPath = path.join(
      __dirname,
      "../data/Toyota corolla Manual 2020.pdf"
    );
    const pagesPDF = await extractPagesFromPDF(pdfPath, pageNumbers);

    res.json({
      answer: answer,
      pages: pageNumbers,
      pagesPDF: pagesPDF.toString("base64"), // המרת ה-PDF ל-Base64
    });
  } catch (error) {
    console.error("Error handling question:", error);
    res.status(500).json({ error: "Error handling question" });
  }
});

module.exports = router;
