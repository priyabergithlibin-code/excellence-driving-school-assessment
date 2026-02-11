const mongoose = require("mongoose");

const ClassTypeSchema = new mongoose.Schema(
  {
    classTypeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ClassType", ClassTypeSchema);
