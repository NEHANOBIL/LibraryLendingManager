
const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    memberName: {
      type: String,
      required: true
    },
    memberId: {
      type: String,
      required: true
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date,
      default: null
    },
    fine: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Issued", "Returned"],
      default: "Issued"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
