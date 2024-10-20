// app.js

require("dotenv").config({ path: "./config.env" });
const express = require("express");
const app = express();

// יבוא של ה-Routes
const pdfRoutes = require("./routes/pdfRoutes");
const askRoutes = require("./routes/askRoutes");

//middleWares
app.use(express.json());
app.use("/pdf", pdfRoutes);
app.use("/ask", askRoutes);

//Server running
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
