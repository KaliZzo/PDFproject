const { Pinecone } = require("@pinecone-database/pinecone");

let pineconeIndex = null;

const initPinecone = async () => {
  if (!pineconeIndex) {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    pineconeIndex = pinecone.Index("nisim"); // הכנס את שם האינדקס ידנית
  }
  return pineconeIndex;
};

// פונקציה לחיפוש embeddings ב-Pinecone
const queryEmbeddings = async (embedding, topK = 5) => {
  try {
    const index = await initPinecone();

    // שליחת השאילתה ל-Pinecone
    const queryResponse = await index.query({
      vector: embedding,
      topK: topK,
      includeMetadata: true,
    });

    return queryResponse.matches;
  } catch (error) {
    console.error("Error querying embeddings:", error);
    throw error;
  }
};

module.exports = { queryEmbeddings };
