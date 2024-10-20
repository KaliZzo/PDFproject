const { Pinecone } = require("@pinecone-database/pinecone");
const dotenv = require("dotenv").config({ path: "./../config.env" });

let pineconeIndex = null;

const initPinecone = async () => {
  try {
    // בדיקה אם apiKey ושם אינדקס מוגדרים
    if (!process.env.PINECONE_API_KEY) {
      throw new Error(
        "PINECONE_API_KEY is not defined in the environment variables."
      );
    }

    if (!pineconeIndex) {
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      // הכנס ידנית את שם האינדקס
      pineconeIndex = pinecone.Index("nisim"); // שם האינדקס
    }

    return pineconeIndex;
  } catch (error) {
    console.error("Error initializing Pinecone:", error.message);
    throw error;
  }
};

const upsertEmbedding = async (id, embedding, metadata) => {
  try {
    const index = await initPinecone();

    // מערך של וקטורים במבנה הנכון
    const vectors = [
      {
        id: id.toString(), // הפיכת ה-ID למחרוזת
        values: embedding, // מערך מספרים של ה-embedding
        metadata: metadata, // מטא-דאטה, אם קיים
      },
    ];

    console.log("Upsert vectors request:", JSON.stringify(vectors, null, 2));

    try {
      // שליחת הווקטורים ל-Pinecone
      const upsertResponse = await index.upsert(vectors);

      console.log(`Successfully upserted embedding for ID: ${id}`);
      console.log("Upsert response:", JSON.stringify(upsertResponse, null, 2));
    } catch (error) {
      console.error(`Error upserting embedding for ID: ${id}`, error);
      console.error("Full error details:", JSON.stringify(error, null, 2));

      // הדפסת מידע נוסף על השגיאה
      if (error.response) {
        console.error("Error Response Status Code:", error.response.status);
        console.error("Error Response Body:", error.response.data);
      } else if (error.request) {
        console.error("Error Request Details:", error.request);
      } else {
        console.error("Error Message:", error.message);
      }

      throw error;
    }
  } catch (error) {
    console.error("Error in upsertEmbedding function:", error.message);
    throw error;
  }
};

const testPineconeConnection = async () => {
  try {
    const index = await initPinecone();
    const description = await index.describeIndexStats();
    console.log(
      "Connected to Pinecone. Index stats:",
      JSON.stringify(description, null, 2)
    );
    return true;
  } catch (error) {
    console.error("Error connecting to Pinecone:", error);

    // הדפסת מידע נוסף על השגיאה
    if (error.response) {
      console.error("Error Response Status Code:", error.response.status);
      console.error("Error Response Body:", error.response.data);
    } else if (error.request) {
      console.error("Error Request Details:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }

    return false;
  }
};

module.exports = {
  upsertEmbedding,
  testPineconeConnection,
};
