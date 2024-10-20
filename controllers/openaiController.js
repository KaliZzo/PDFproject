const { OpenAI } = require("openai");

// יצירת אובייקט OpenAI עם ה-API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAnswerFromAI = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // או gpt-4 אם יש לך גישה
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
    });

    // הדפסת התגובה המלאה כדי להבין את המבנה שלה
    console.log("API Response:", response);

    // החזרת התשובה מתוך התגובה
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error in OpenAI API request:", error);
    throw error;
  }
};

module.exports = { getAnswerFromAI };
