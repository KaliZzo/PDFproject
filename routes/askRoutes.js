const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { createEmbedding } = require("../controllers/embeddingController");
const { queryEmbeddings } = require("../utils/pineconeQuery");
const { getAnswerFromAI } = require("../controllers/openaiController");
const { extractPagesFromPDF } = require("../controllers/pdfController");

// הגדרת אחסון עבור multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const question = req.body.question;
    const image = req.file;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    console.log("Received question:", question);

    let imagePath = null;
    let imageInfo = "";
    if (image) {
      imagePath = image.path;
      console.log("Received image:", image.filename);
      const stats = fs.statSync(imagePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      imageInfo = `The user uploaded an image: ${
        image.filename
      }. The image size is ${fileSizeInMB.toFixed(2)} MB. `;
    }

    // צעד 1: יצירת Embedding עבור השאלה
    const questionEmbedding = await createEmbedding(question);

    // צעד 2: שאילתת קטעים רלוונטיים מ-Pinecone
    const relevantSections = await queryEmbeddings(questionEmbedding, 5);
    if (!relevantSections || relevantSections.length === 0) {
      return res.status(404).json({ error: "No relevant sections found" });
    }

    let systemContent = `You are an AI assistant specializing in automotive knowledge, particularly for Toyota vehicles. Your primary task is to answer the user's question based on the following information:

    1. Relevant sections from the car manual:
    `;

    relevantSections.forEach((section) => {
      systemContent += `Page ${section.metadata.pageNumber}:\n${section.metadata.text}\n\n`;
    });

    systemContent += `
    2. User's question and context:
    ${question}
    
    Instructions:
    1. Carefully analyze the provided manual sections and the user's question.
    2. If the manual sections contain relevant information, use it to formulate your answer. Always specify the exact page numbers you're referencing in your answer.
    3. If the manual sections do not contain sufficient or relevant information, clearly state this and then draw upon your general automotive knowledge to provide a helpful response.
    4. If an image is provided, analyze it in relation to the question and the manual information.
    5. Provide a clear, concise, and accurate answer.
    6. If you're unsure about any aspect, state your uncertainty and provide the most helpful information you can.
    7. IMPORTANT: Throughout your answer, whenever you use information from the manual, immediately follow it with the page number in parentheses. For example: "The Bluetooth connection process (Page 312) involves..."
    8. At the end of your answer, include two separate statements, each starting on a new line and preceded by "SOURCE_INFO:":
       a) SOURCE_INFO: This information is primarily based on [specify source: manual pages X, Y, Z / general automotive knowledge / image analysis / combination of sources].
       b) SOURCE_INFO: The following manual pages were consulted: [list all page numbers provided, even if not all were used in the answer].
    
    Remember, it is crucial to clearly indicate the source of each piece of information in your answer, especially when it comes from the manual pages provided.`;

    if (imagePath) {
      systemContent += `
    
    9. An image has been provided. Analyze this image in relation to the question and the manual information. Describe what you see in the image if it's relevant to the query.`;
    }

    systemContent += `
    
    Your goal is to be as helpful and accurate as possible, always citing your sources clearly and precisely.`;

    // צעד 4: שימוש ב-GPT לפישוט התשובה
    const refinedAnswer = await getAnswerFromAI(systemContent, imagePath);

    // צעד 5: צירוף מספרי עמודים ומידע על ה-PDF
    const pageNumbers = [
      ...new Set(
        relevantSections.map((section) => section.metadata.pageNumber)
      ),
    ];
    const pdfPath = path.join(
      __dirname,
      "../data/Toyota corolla Manual 2020.pdf"
    );
    const pagesPDF = await extractPagesFromPDF(pdfPath, pageNumbers);

    // צעד 6: מענה עם תשובה מעובדת, PDF ומידע על התמונה
    res.json({
      answer: refinedAnswer,
      pages: pageNumbers,
      pagesPDF: pagesPDF.toString("base64"),
      imageInfo: image
        ? {
            filename: image.filename,
            size: `${(image.size / (1024 * 1024)).toFixed(2)} MB`,
            path: image.path,
          }
        : null,
    });
  } catch (error) {
    console.error("Error handling question:", error);
    res.status(500).json({ error: "Error handling question" });
  }
});

module.exports = router;
