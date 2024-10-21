// app.js

require("dotenv").config({ path: "./config.env" });
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());

// יבוא של ה-Routes
const pdfRoutes = require("./routes/pdfRoutes");
const askRoutes = require("./routes/askRoutes");

//middleWares
app.use(express.json());
app.use("/pdf", pdfRoutes);
app.use("/ask", askRoutes);
app.use("/pdf", express.static(path.join(__dirname, "data")));

//Server running
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
