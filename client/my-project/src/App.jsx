import React, { useState } from "react";
import axios from "axios";
import CarButton from "../components/carButton";
//
const App = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pages, setPages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFullManual, setShowFullManual] = useState(false);

  const handleAskQuestion = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("question", question);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post("http://localhost:3000/ask", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { answer, pages, pagesPDF } = response.data;

      setAnswer(answer);
      setPages(pages);
      setPdfUrl(`data:application/pdf;base64,${pagesPDF}`);
      setShowFullManual(false);
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("Sorry, an error occurred while processing your question.");
    } finally {
      setLoading(false);
    }
  };

  const formatAnswer = (text) => {
    const parts = text.split("SOURCE_INFO:");
    const mainContent = parts[0].trim();
    const sourceInfo = parts.slice(1).map((info) => info.trim());

    const formatParagraph = (paragraph) => {
      return paragraph.split(/(\(Page \d+\))/).map((part, index) =>
        part.match(/\(Page \d+\)/) ? (
          <span key={index} className="font-semibold text-indigo-600">
            {part}
          </span>
        ) : (
          part
        )
      );
    };

    return (
      <div className="space-y-6">
        <div className="text-gray-800 leading-relaxed">
          {mainContent.split("\n").map((paragraph, index) => {
            if (
              paragraph.trim().startsWith("•") ||
              paragraph.trim().match(/^\d+\./)
            ) {
              return (
                <li key={index} className="ml-6 mb-2">
                  {formatParagraph(
                    paragraph
                      .trim()
                      .replace(/^•|\d+\./, "")
                      .trim()
                  )}
                </li>
              );
            } else {
              return (
                <p key={index} classNam e="mb-4">
                  {formatParagraph(paragraph)}
                </p>
              );
            }
          })}
        </div>
        {sourceInfo.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">
              Source Information:
            </h3>
            {sourceInfo.map((info, index) => (
              <p
                key={index}
                className="text-sm text-indigo-700 font-medium mb-1"
              >
                {formatParagraph(info)}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleFullManual = () => {
    if (showFullManual) {
      setPdfUrl("");
      setShowFullManual(false);
    } else {
      setPdfUrl(
        `http://localhost:3000/pdf/Toyota%20corolla%20Manual%202020.pdf`
      );
      setShowFullManual(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Car Manual Assistant
        </h1>

        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
          <div className="mb-6">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ask a question about your car
            </label>
            <input
              type="text"
              id="question"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="How do I connect to Bluetooth?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload an image (optional)
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>

          <button
            onClick={handleAskQuestion}
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : "Ask"}
          </button>
        </div>

        {answer && (
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Answer:</h2>
            <div className="text-gray-700">{formatAnswer(answer)}</div>
          </div>
        )}

        {pdfUrl && (
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {showFullManual ? "Full Car Manual" : "Relevant Manual Pages"}:
            </h2>
            <iframe
              src={pdfUrl}
              width="100%"
              height="800px"
              title="PDF Viewer"
              className="border border-gray-200 rounded-lg"
            />
          </div>
        )}

        {answer && (
          <div className="flex justify-center items-center mt-8">
            <CarButton onClick={toggleFullManual} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
