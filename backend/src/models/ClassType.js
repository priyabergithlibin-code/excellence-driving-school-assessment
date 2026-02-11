const mongoose = require("mongoose");

const ClassTypeSchema = new mongoose.Schema(
  {
    classId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
  },
  { timestamps: true, collection: "classTypes" },
);

module.exports =
  mongoose.models.ClassType || mongoose.model("ClassType", ClassTypeSchema);
