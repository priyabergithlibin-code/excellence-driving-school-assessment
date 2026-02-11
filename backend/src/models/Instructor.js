const mongoose = require("mongoose");

const InstructorSchema = new mongoose.Schema(
  {
    instructorId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Instructor", InstructorSchema);
