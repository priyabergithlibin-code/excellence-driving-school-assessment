const AppConfig = require("../../models/AppConfig");
const { env } = require("../../config/env");

async function getEffectiveConfig() {
  const doc = await AppConfig.findOne().lean();

  return {
    MAX_CLASSES_PER_STUDENT_PER_DAY:
      doc?.MAX_CLASSES_PER_STUDENT_PER_DAY ??
      env.MAX_CLASSES_PER_STUDENT_PER_DAY,
    MAX_CLASSES_PER_INSTRUCTOR_PER_DAY:
      doc?.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY ??
      env.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY,
    CLASS_DURATION_MINUTES:
      doc?.CLASS_DURATION_MINUTES ?? env.CLASS_DURATION_MINUTES,
    MAX_CLASSES_PER_CLASSTYPE_PER_DAY:
      doc?.MAX_CLASSES_PER_CLASSTYPE_PER_DAY ??
      env.MAX_CLASSES_PER_CLASSTYPE_PER_DAY,
  };
}

module.exports = { getEffectiveConfig };
