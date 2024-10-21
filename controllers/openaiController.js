const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAnswerFromAI = async (prompt, imagePath = null) => {
  try {
    let messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant. Answer the user's question based on the information provided, including any images if present.",
      },
    ];

    if (
      imagePath &&
      typeof imagePath === "string" &&
      fs.existsSync(imagePath)
    ) {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      messages.push({
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      });
    } else {
      console.log("No valid image path provided or file does not exist.");
      messages.push({
        role: "user",
        content: prompt,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      max_tokens: 300,
    });

    console.log("API Response:", response);
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error in OpenAI API request:", error);
    throw error;
  }
};

module.exports = { getAnswerFromAI };
