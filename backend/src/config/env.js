require("dotenv").config();

function getInt(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const env = {
  PORT: getInt("PORT", 4000),
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/driving_school",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  MAX_CLASSES_PER_STUDENT_PER_DAY: getInt("MAX_CLASSES_PER_STUDENT_PER_DAY", 3),
  MAX_CLASSES_PER_INSTRUCTOR_PER_DAY: getInt(
    "MAX_CLASSES_PER_INSTRUCTOR_PER_DAY",
    6,
  ),
  CLASS_DURATION_MINUTES: getInt("CLASS_DURATION_MINUTES", 45),
  MAX_CLASSES_PER_CLASSTYPE_PER_DAY: getInt(
    "MAX_CLASSES_PER_CLASSTYPE_PER_DAY",
    10,
  ),

  AUTO_ADD_STUDENTS: process.env.AUTO_ADD_STUDENTS || "true",
};

module.exports = { env };
