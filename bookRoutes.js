
const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Loan = require("../models/Loan");

// ADD BOOK
router.post("/", async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body;

    if (!title || !author || !isbn || !category ||
        !Number.isInteger(totalCopies) ||
        totalCopies < 1 || totalCopies > 20 ||
        !/^\d{10}$|^\d{13}$/.test(isbn)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book details",
        data: null
      });
    }

    const exists = await Book.findOne({ isbn });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "ISBN already exists",
        data: null
      });
    }

    const count = await Book.countDocuments({ category });
    const bookCode = `LB-${category.substring(0, 3).toUpperCase()}-${String(count + 1).padStart(3, "0")}`;

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies: totalCopies,
      bookCode
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: book
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// GET BOOKS WITH SEARCH, FILTER AND PAGINATION
router.get("/", async (req, res) => {
  try {
    const { search, category, available, page = 1 } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (available === "true") filter.availableCopies = { $gt: 0 };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }

    const limit = 5;
    const books = await Book.find(filter)
      .skip((Number(page) - 1) * limit)
      .limit(limit);

    const total = await Book.countDocuments(filter);

    res.json({
      success: true,
      message: "Books fetched",
      data: {
        books,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

module.exports = router;
