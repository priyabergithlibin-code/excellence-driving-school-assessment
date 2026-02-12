const mongoose = require("mongoose");

const AppConfigSchema = new mongoose.Schema(
  {
    MAX_CLASSES_PER_STUDENT_PER_DAY: { type: Number, default: 3 },
    MAX_CLASSES_PER_INSTRUCTOR_PER_DAY: { type: Number, default: 6 },
    CLASS_DURATION_MINUTES: { type: Number, default: 45 },
    MAX_CLASSES_PER_CLASSTYPE_PER_DAY: { type: Number, default: 10 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AppConfig", AppConfigSchema);
