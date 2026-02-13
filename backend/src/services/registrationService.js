const { env } = require("../config/env");
const Registration = require("../models/Registration");
const Student = require("../models/Student.js");
const Instructor = require("../models/Instructor");
const ClassType = require("../models/ClassType");
const { getEffectiveConfig } = require("../services/config/getEffectiveConfig");

function cleanValue(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s || s.toLowerCase() === "null") return null;
  return s;
}

function parseMDY_HM(input) {
  const s = cleanValue(input);
  if (!s) return null;

  const [datePart, timePart] = s.split(" ");
  if (!datePart || !timePart) return null;

  const [m, d, y] = datePart.split("/").map((x) => parseInt(x, 10));
  const [hh, mm] = timePart.split(":").map((x) => parseInt(x, 10));

  if (![m, d, y, hh, mm].every((n) => Number.isFinite(n))) return null;

  const dt = new Date(y, m - 1, d, hh, mm, 0, 0); // local time
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

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

function normalizeRow(row) {
  const action = cleanValue(row["Action"])?.toLowerCase();

  const registrationId = cleanValue(row["Registration ID"]);
  const studentId = cleanValue(row["Student ID"]);
  const instructorId = cleanValue(row["Instructor ID"]);
  const classId = cleanValue(row["Class ID"]);
  const startAt = parseMDY_HM(row["Class Start Time"]);

  return { action, registrationId, studentId, instructorId, classId, startAt };
}

async function validateMasterLists({ studentId, instructorId, classId }) {
  if (studentId) {
    const studentExists = await Student.findOne({ studentId }).lean();
    if (!studentExists) {
      if (String(env.AUTO_ADD_STUDENTS).toLowerCase() === "true") {
        await Student.create({ studentId });
      } else {
        throw new Error(`Invalid Student ID: ${studentId}`);
      }
    }
  }

  if (instructorId) {
    const instructorExists = await Instructor.findOne({ instructorId }).lean();
    if (!instructorExists)
      throw new Error(`Invalid Instructor ID: ${instructorId}`);
  }

  if (classId) {
    const classExists = await ClassType.findOne({ classId }).lean();
    if (!classExists) throw new Error(`Invalid Class ID: ${classId}`);
  }
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
  if (conflict)
    throw new Error("Overlapping session for same student or instructor");
}

async function ensureDailyLimits(
  { studentId, instructorId, classId, startAt, excludeMongoId = null },
  cfg,
) {
  const { start, end } = getDayBounds(startAt);

  if (studentId) {
    const q = {
      studentId,
      status: "active",
      startAt: { $gte: start, $lte: end },
    };
    if (excludeMongoId) q._id = { $ne: excludeMongoId };

    const count = await Registration.countDocuments(q);
    if (count >= Number(cfg.MAX_CLASSES_PER_STUDENT_PER_DAY)) {
      throw new Error(
        `Student daily limit exceeded (${cfg.MAX_CLASSES_PER_STUDENT_PER_DAY})`,
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
    if (count >= Number(cfg.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY)) {
      throw new Error(
        `Instructor daily limit exceeded (${cfg.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY})`,
      );
    }
  }

  if (classId && cfg.MAX_CLASSES_PER_CLASSTYPE_PER_DAY != null) {
    const q = {
      classId,
      status: "active",
      startAt: { $gte: start, $lte: end },
    };
    if (excludeMongoId) q._id = { $ne: excludeMongoId };

    const count = await Registration.countDocuments(q);
    if (count >= Number(cfg.MAX_CLASSES_PER_CLASSTYPE_PER_DAY)) {
      throw new Error(
        `Class-type daily limit exceeded (${cfg.MAX_CLASSES_PER_CLASSTYPE_PER_DAY})`,
      );
    }
  }
}

async function handleNew(row, cfg) {
  if (!row.studentId || !row.instructorId || !row.classId || !row.startAt) {
    throw new Error(
      "Missing required fields for new (Student ID, Instructor ID, Class ID, Class Start Time)",
    );
  }

  await validateMasterLists(row);

  const duration = Number(cfg.CLASS_DURATION_MINUTES);
  const endAt = addMinutes(row.startAt, duration);

  await ensureNoOverlap({
    studentId: row.studentId,
    instructorId: row.instructorId,
    startAt: row.startAt,
    endAt,
  });

  await ensureDailyLimits(
    {
      studentId: row.studentId,
      instructorId: row.instructorId,
      classId: row.classId,
      startAt: row.startAt,
    },
    cfg,
  );

  const created = await Registration.create({
    studentId: row.studentId,
    instructorId: row.instructorId,
    classId: row.classId,
    startAt: row.startAt,
    endAt,
    status: "active",
  });

  return { registrationId: String(created._id) };
}

async function handleUpdate(row, cfg) {
  if (!row.registrationId)
    throw new Error("Registration ID is required for update");

  const existing = await Registration.findById(row.registrationId);
  if (!existing)
    throw new Error(`Registration not found: ${row.registrationId}`);

  const nextStudentId = row.studentId ?? existing.studentId;
  const nextInstructorId = row.instructorId ?? existing.instructorId;
  const nextClassId = row.classId ?? existing.classId;
  const nextStartAt = row.startAt ?? existing.startAt;

  if (!nextStudentId || !nextInstructorId || !nextClassId || !nextStartAt) {
    throw new Error("Update results in missing required fields");
  }

  await validateMasterLists({
    studentId: nextStudentId,
    instructorId: nextInstructorId,
    classId: nextClassId,
  });

  const duration = Number(cfg.CLASS_DURATION_MINUTES);
  const nextEndAt = addMinutes(nextStartAt, duration);

  await ensureNoOverlap({
    studentId: nextStudentId,
    instructorId: nextInstructorId,
    startAt: nextStartAt,
    endAt: nextEndAt,
    excludeMongoId: existing._id,
  });

  await ensureDailyLimits(
    {
      studentId: nextStudentId,
      instructorId: nextInstructorId,
      classId: nextClassId,
      startAt: nextStartAt,
      excludeMongoId: existing._id,
    },
    cfg,
  );

  existing.studentId = nextStudentId;
  existing.instructorId = nextInstructorId;
  existing.classId = nextClassId;
  existing.startAt = nextStartAt;
  existing.endAt = nextEndAt;

  await existing.save();

  return { registrationId: String(existing._id) };
}

async function handleDelete(row) {
  if (!row.registrationId)
    throw new Error("Registration ID is required for delete");

  const existing = await Registration.findById(row.registrationId);
  if (!existing)
    throw new Error(`Registration not found: ${row.registrationId}`);

  existing.status = "canceled";
  await existing.save();

  return { registrationId: String(existing._id) };
}

async function processRegistrations(rawRows) {
  const cfg = await getEffectiveConfig();

  const results = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 1;

    try {
      const row = normalizeRow(rawRows[i]);

      if (!row.action) throw new Error("Action is required");
      if (!["new", "update", "delete"].includes(row.action)) {
        throw new Error(`Invalid action: ${row.action}`);
      }

      let payload;
      if (row.action === "new") payload = await handleNew(row, cfg);
      if (row.action === "update") payload = await handleUpdate(row, cfg);
      if (row.action === "delete") payload = await handleDelete(row);

      results.push({
        row: rowNumber,
        action: row.action,
        status: "success",
        ...payload,
      });
    } catch (err) {
      results.push({
        row: rowNumber,
        action: cleanValue(rawRows[i]?.["Action"]) || null,
        status: "error",
        reason: err?.message || "Unknown error",
      });
    }
  }

  return { ok: true, total: rawRows.length, results };
}

module.exports = { processRegistrations };
