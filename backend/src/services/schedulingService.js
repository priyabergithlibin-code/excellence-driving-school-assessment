const { env } = require("../config/env");
const Registration = require("../models/Registration");

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getDayBounds(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function ensureNoOverlap({
  studentId,
  instructorId,
  startAt,
  endAt,
  excludeMongoId = null,
}) {
  const or = [];
  if (studentId) or.push({ studentId });
  if (instructorId) or.push({ instructorId });
  if (or.length === 0) return;

  const q = {
    status: "active",
    $or: or,
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  };

  if (excludeMongoId) q._id = { $ne: excludeMongoId };

  const conflict = await Registration.findOne(q).lean();
  if (conflict) {
    throw new Error("Overlapping session for same student or instructor");
  }
}

async function ensureDailyLimits({
  studentId,
  instructorId,
  classId,
  startAt,
  excludeMongoId = null,
}) {
  const { start, end } = getDayBounds(startAt);

  if (studentId) {
    const q = {
      studentId,
      status: "active",
      startAt: { $gte: start, $lte: end },
    };
    if (excludeMongoId) q._id = { $ne: excludeMongoId };
    const count = await Registration.countDocuments(q);

    if (count >= Number(env.MAX_CLASSES_PER_STUDENT_PER_DAY)) {
      throw new Error(
        `Student daily limit exceeded (${env.MAX_CLASSES_PER_STUDENT_PER_DAY})`,
      );
    }
  }

  if (instructorId) {
    const q = {
      instructorId,
      status: "active",
      startAt: { $gte: start, $lte: end },
    };
    if (excludeMongoId) q._id = { $ne: excludeMongoId };
    const count = await Registration.countDocuments(q);

    if (count >= Number(env.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY)) {
      throw new Error(
        `Instructor daily limit exceeded (${env.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY})`,
      );
    }
  }

  if (classId && env.MAX_CLASSES_PER_CLASSTYPE_PER_DAY) {
    const q = {
      classId,
      status: "active",
      startAt: { $gte: start, $lte: end },
    };
    if (excludeMongoId) q._id = { $ne: excludeMongoId };
    const count = await Registration.countDocuments(q);

    if (count >= Number(env.MAX_CLASSES_PER_CLASSTYPE_PER_DAY)) {
      throw new Error(
        `Class-type daily limit exceeded (${env.MAX_CLASSES_PER_CLASSTYPE_PER_DAY})`,
      );
    }
  }
}

module.exports = {
  addMinutes,
  getDayBounds,
  ensureNoOverlap,
  ensureDailyLimits,
};
