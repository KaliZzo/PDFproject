// controllers/embeddingController.js

const { OpenAI } = require("openai");

// יצירת אובייקט OpenAI עם ה-API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    // הדפסת התגובה המלאה מה-API כדי שנוכל להבין את המבנה שלה
    console.log("OpenAI API response:", JSON.stringify(response, null, 2));

    // בדיקה שהתשובה כוללת את הנתונים הצפויים
    if (
      response &&
      response.data &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      return response.data[0].embedding;
    } else {
      throw new Error("Unexpected API response structure");
    }
  } catch (error) {
    console.error("Error creating embedding:", error.message || error);
    throw error; // נמשיך להעביר את השגיאה כדי שנדע איפה הבעיה
  }
};

module.exports = {
  createEmbedding,
};
