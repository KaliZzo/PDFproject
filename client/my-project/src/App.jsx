// App.jsx

import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pages, setPages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [image, setImage] = useState(null);

  const handleAskQuestion = async () => {
    const formData = new FormData();
    formData.append("question", question);
    if (image) {
      formData.append("image", image); // Attach image if provided
    }

    try {
      const response = await axios.post("http://localhost:3000/ask", formData, {
        headers: { "Content-Type": "multipart/form-data" }, // Required for image upload
      });
      const { answer, pages, pagesPDF } = response.data;

      setAnswer(answer);
      setPages(pages);
      setPdfUrl(
        `http://localhost:3000/pdf/Toyota%20corolla%20Manual%202020.pdf`
      );
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Car Manual Assistant</h1>

      <div className="mb-4">
        <input
          type="text"
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])} // Capture image
        />
      </div>

      <button
        onClick={handleAskQuestion}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Ask
      </button>

      <div className="bg-gray-100 p-4 rounded mt-4">
        <h2 className="text-xl font-bold">Answer:</h2>
        <p className="text-gray-700 mb-4">{answer}</p>
        {pages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold">
              Relevant Pages: {pages.join(", ")}
            </h3>
          </div>
        )}
      </div>

      {pdfUrl && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">PDF Document:</h3>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            title="PDF Viewer"
            className="border border-gray-300 rounded"
          />
        </div>
      )}
    </div>
  );
};

export default App;
