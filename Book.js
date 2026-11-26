
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{10}$|^\d{13}$/
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Fiction",
        "Science",
        "History",
        "Technology",
        "Biography",
        "Other"
      ]
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    availableCopies: {
      type: Number,
      required: true
    },
    bookCode: {
      type: String,
      unique: true,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
