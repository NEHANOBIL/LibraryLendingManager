
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Library Lending Manager API is running",
    data: null
  });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });
