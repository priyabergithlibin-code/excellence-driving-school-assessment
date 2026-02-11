const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", StudentSchema);
