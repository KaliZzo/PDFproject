// controllers/pdfController.js
const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");
const { createEmbedding } = require("./embeddingController");
const { upsertEmbedding } = require("../utils/vectorDatabase");
const { PDFDocument } = require("pdf-lib");

const processPDF = async (pdfPath) => {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);

  // חלוקת הטקסט לפי עמודים
  const pages = data.text.split("\f");

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageText = pages[pageIndex];
    const pageNumber = pageIndex + 1;

    // חלוקת העמוד לפסקאות כדי להקטין את כמות הטוקנים
    const paragraphs = pageText.split(/\n\n+/); // מפריד לפסקאות לפי רווח כפול

    for (let paraIndex = 0; paraIndex < paragraphs.length; paraIndex++) {
      const paragraphText = paragraphs[paraIndex];

      if (paragraphText.trim().length > 0) {
        try {
          // יצירת Embedding לפסקה
          const embedding = await createEmbedding(paragraphText);

          // מטא-דאטה הכוללת את מספר העמוד והפסקה
          const metadata = {
            text: paragraphText,
            pageNumber: pageNumber,
            paragraphIndex: paraIndex + 1,
          };

          // הכנסה למאגר הנתונים הווקטורי
          await upsertEmbedding(
            `${pageNumber}_${paraIndex + 1}`,
            embedding,
            metadata
          );
        } catch (error) {
          console.error(
            `Error processing paragraph ${
              paraIndex + 1
            } on page ${pageNumber}:`,
            error
          );
        }
      }
    }
  }

  console.log("PDF processing and embeddings creation completed.");
};

const extractPagesFromPDF = async (pdfPath, pageNumbers) => {
  const existingPdfBytes = fs.readFileSync(pdfPath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const newPdfDoc = await PDFDocument.create();

  for (const pageNumber of pageNumbers) {
    const [page] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
    newPdfDoc.addPage(page);
  }

  const pdfBytes = await newPdfDoc.save();
  return pdfBytes;
};

module.exports = {
  processPDF,
  extractPagesFromPDF,
};
