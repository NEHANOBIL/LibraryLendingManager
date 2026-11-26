
const express = require("express");
const router = express.Router();

const Loan = require("../models/Loan");
const Book = require("../models/Book");

// ISSUE BOOK
router.post("/issue", async (req, res) => {
  try {
    const { bookId, memberName, memberId, issueDate } = req.body;

    if (!bookId || !memberName || !memberId) {
      return res.status(400).json({
        success: false,
        message: "All details are required",
        data: null
      });
    }

    const date = issueDate ? new Date(issueDate) : new Date();

    if (isNaN(date.getTime()) || date > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue date",
        data: null
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        data: null
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(409).json({
        success: false,
        message: "No copies available",
        data: null
      });
    }

    const existingLoan = await Loan.findOne({
      book: bookId,
      memberId,
      status: "Issued"
    });

    if (existingLoan) {
      return res.status(409).json({
        success: false,
        message: "Member already has this book",
        data: null
      });
    }

    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 14);

    const loan = await Loan.create({
      book: bookId,
      memberName,
      memberId,
      issueDate: date,
      dueDate
    });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// RETURN BOOK
router.put("/return/:id", async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
        data: null
      });
    }

    if (loan.status === "Returned") {
      return res.status(409).json({
        success: false,
        message: "Book already returned",
        data: null
      });
    }

    const returnDate = new Date();

    const lateDays = Math.max(
      0,
      Math.floor(
        (returnDate.setHours(0, 0, 0, 0) -
          new Date(loan.dueDate).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      )
    );

    loan.returnDate = new Date();
    loan.fine = lateDays * 5;
    loan.status = "Returned";

    await loan.save();

    const book = await Book.findById(loan.book);

    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json({
      success: true,
      message: "Book returned successfully",
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// LOAN HISTORY
router.get("/", async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("book", "title bookCode")
      .sort({ createdAt: -1 });

    const data = loans.map(loan => ({
      ...loan.toObject(),
      isOverdue:
        loan.status === "Issued" && new Date() > loan.dueDate
    }));

    res.json({
      success: true,
      message: "Loan history fetched",
      data
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
