const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    classId: { type: String, required: true, unique: true },
    instructor: String,
    date: String,
    time: String,
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Schedule", scheduleSchema);
