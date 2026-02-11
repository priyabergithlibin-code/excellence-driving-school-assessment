const mongoose = require("mongoose");
const Registration = require("../../models/Registration");
const Student = require("../../models/student");
const Instructor = require("../../models/Instructor");
const ClassType = require("../../models/ClassType");
const Counter = require("../../models/Counter");

const CLASS_DURATION_MINUTES = Number(process.env.CLASS_DURATION_MINUTES || 45);
const MAX_STUDENT_CLASSES_PER_DAY = Number(
  process.env.MAX_STUDENT_CLASSES_PER_DAY || 3,
);
const MAX_INSTRUCTOR_CLASSES_PER_DAY = Number(
  process.env.MAX_INSTRUCTOR_CLASSES_PER_DAY || 6,
);

const MAX_CLASSES_PER_TYPE_PER_DAY =
  process.env.MAX_CLASSES_PER_TYPE_PER_DAY != null
    ? Number(process.env.MAX_CLASSES_PER_TYPE_PER_DAY)
    : null;

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function toTrimmedString(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;

  if (["null", "undefined", "na", "n/a", "-"].includes(s.toLowerCase()))
    return null;

  return s;
}

function getField(row, fieldName) {
  const target = String(fieldName).trim().toLowerCase();

  for (const key of Object.keys(row || {})) {
    const normalizedKey = String(key)
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase();
    if (normalizedKey === target) return row[key];
  }
  return undefined;
}

function parseStartTime(row) {
  const raw =
    getField(row, "Class Start Time") ??
    getField(row, "class start time") ??
    getField(row, "class_start_time") ??
    getField(row, "startTime") ??
    getField(row, "start time") ??
    getField(row, "start_time") ??
    null;

  if (!raw) return null;

  const s = String(raw).trim();

  let d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d;

  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (m) {
    const mm = Number(m[1]);
    const dd = Number(m[2]);
    const yyyy = Number(m[3]);
    const HH = Number(m[4]);
    const MIN = Number(m[5]);
    d = new Date(yyyy, mm - 1, dd, HH, MIN, 0, 0);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function dayRange(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function okResult({ rowIndex, action, registrationId, message }) {
  return {
    row: rowIndex + 1,
    action,
    status: "success",
    registrationId: registrationId ?? null,
    message: message || "OK",
  };
}

function errResult({ rowIndex, action, message }) {
  return {
    row: rowIndex + 1,
    action,
    status: "error",
    message: message || "Unknown error",
  };
}

async function getNextRegistrationId() {
  const counter = await Counter.findOneAndUpdate(
    { name: "registrationId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq; // 1001, 1002, ...
}

function toRegistrationIdNumber(value) {
  const s = toTrimmedString(value);
  if (!s) return null;
  const n = Number(s);
  if (!Number.isInteger(n)) return null;
  return n;
}

async function hasOverlap({
  studentId,
  instructorId,
  startTime,
  endTime,
  excludeMongoId,
}) {
  const query = {
    status: "active",
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    $or: [{ studentId }, { instructorId }],
  };

  if (excludeMongoId) {
    query._id = { $ne: excludeMongoId };
  }

  const conflict = await Registration.findOne(query).lean();
  return !!conflict;
}

async function countByDay(filter, date, excludeMongoId = null) {
  const { start, end } = dayRange(date);

  const query = {
    status: "active",
    startTime: { $gte: start, $lte: end },
    ...filter,
  };

  if (excludeMongoId) query._id = { $ne: excludeMongoId };

  return Registration.countDocuments(query);
}

async function ensureStudent(studentId) {
  const exists = await Student.findOne({ studentId }).select("_id").lean();
  if (exists) return true;
  await Student.create({ studentId });
  return true;
}

async function ensureInstructor(instructorId) {
  const exists = await Instructor.findOne({ instructorId })
    .select("_id")
    .lean();
  return !!exists;
}

async function ensureClassType(classTypeId) {
  const exists = await ClassType.findOne({ classTypeId }).select("_id").lean();
  return !!exists;
}

async function processRegistrations(rows) {
  const results = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const action = normalizeAction(getField(row, "Action"));

    try {
      if (!action) {
        results.push(
          errResult({
            rowIndex: i,
            action: null,
            message: "Missing Action column",
          }),
        );
        continue;
      }

      if (!["new", "update", "delete"].includes(action)) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: `Invalid action '${action}'`,
          }),
        );
        continue;
      }

      const registrationIdRaw = getField(row, "Registration ID");
      const registrationIdNum = toRegistrationIdNumber(registrationIdRaw);

      const studentId = toTrimmedString(getField(row, "Student ID"));
      const instructorId = toTrimmedString(getField(row, "Instructor ID"));
      const classTypeId = toTrimmedString(getField(row, "Class ID"));

      if (action === "delete") {
        if (!registrationIdNum) {
          results.push(
            errResult({
              rowIndex: i,
              action,
              message: "Registration ID is required for delete",
            }),
          );
          continue;
        }

        const existing = await Registration.findOne({
          registrationId: registrationIdNum,
        });
        if (!existing) {
          results.push(
            errResult({
              rowIndex: i,
              action,
              message: "Registration not found",
            }),
          );
          continue;
        }

        existing.status = "canceled";
        await existing.save();

        results.push(
          okResult({
            rowIndex: i,
            action,
            registrationId: existing.registrationId,
            message: "Canceled",
          }),
        );
        continue;
      }

      if (!studentId || !instructorId || !classTypeId) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message:
              "Student ID, Instructor ID, Class ID are required for new/update",
          }),
        );
        continue;
      }

      const startTime = parseStartTime(row);
      if (!startTime) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: "Invalid or missing Class Start Time",
          }),
        );
        continue;
      }

      const endTime = addMinutes(startTime, CLASS_DURATION_MINUTES);

      await ensureStudent(studentId);

      if (!(await ensureInstructor(instructorId))) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: `Invalid Instructor ID '${instructorId}'`,
          }),
        );
        continue;
      }

      if (!(await ensureClassType(classTypeId))) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: `Invalid Class ID '${classTypeId}'`,
          }),
        );
        continue;
      }

      if (action === "new") {
        if (await hasOverlap({ studentId, instructorId, startTime, endTime })) {
          results.push(
            errResult({
              rowIndex: i,
              action,
              message: "Overlap: student or instructor already booked",
            }),
          );
          continue;
        }

        if (
          (await countByDay({ studentId }, startTime)) >=
          MAX_STUDENT_CLASSES_PER_DAY
        ) {
          results.push(
            errResult({
              rowIndex: i,
              action,
              message: `Student daily limit exceeded (${MAX_STUDENT_CLASSES_PER_DAY})`,
            }),
          );
          continue;
        }

        if (
          (await countByDay({ instructorId }, startTime)) >=
          MAX_INSTRUCTOR_CLASSES_PER_DAY
        ) {
          results.push(
            errResult({
              rowIndex: i,
              action,
              message: `Instructor daily limit exceeded (${MAX_INSTRUCTOR_CLASSES_PER_DAY})`,
            }),
          );
          continue;
        }

        if (
          MAX_CLASSES_PER_TYPE_PER_DAY != null &&
          (await countByDay({ classTypeId }, startTime)) >=
            MAX_CLASSES_PER_TYPE_PER_DAY
        ) {
          results.push(
            errResult({
              rowIndex: i,
              action,
              message: `Class daily limit exceeded (${MAX_CLASSES_PER_TYPE_PER_DAY})`,
            }),
          );
          continue;
        }
        const nextRegistrationId = await getNextRegistrationId();

        const created = await Registration.create({
          registrationId: nextRegistrationId,
          studentId,
          instructorId,
          classTypeId,
          startTime,
          endTime,
          status: "active",
        });

        results.push(
          okResult({
            rowIndex: i,
            action,
            registrationId: created.registrationId,
            message: "Created",
          }),
        );
        continue;
      }

      if (!registrationIdNum) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: "Registration ID (number) is required for update",
          }),
        );
        continue;
      }

      const existing = await Registration.findOne({
        registrationId: registrationIdNum,
      });
      if (!existing) {
        results.push(
          errResult({ rowIndex: i, action, message: "Registration not found" }),
        );
        continue;
      }

      if (
        await hasOverlap({
          studentId,
          instructorId,
          startTime,
          endTime,
          excludeMongoId: existing._id,
        })
      ) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: "Overlap: student or instructor already booked",
          }),
        );
        continue;
      }

      if (
        (await countByDay({ studentId }, startTime, existing._id)) >=
        MAX_STUDENT_CLASSES_PER_DAY
      ) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: `Student daily limit exceeded (${MAX_STUDENT_CLASSES_PER_DAY})`,
          }),
        );
        continue;
      }

      if (
        (await countByDay({ instructorId }, startTime, existing._id)) >=
        MAX_INSTRUCTOR_CLASSES_PER_DAY
      ) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: `Instructor daily limit exceeded (${MAX_INSTRUCTOR_CLASSES_PER_DAY})`,
          }),
        );
        continue;
      }

      if (
        MAX_CLASSES_PER_TYPE_PER_DAY != null &&
        (await countByDay({ classTypeId }, startTime, existing._id)) >=
          MAX_CLASSES_PER_TYPE_PER_DAY
      ) {
        results.push(
          errResult({
            rowIndex: i,
            action,
            message: `Class daily limit exceeded (${MAX_CLASSES_PER_TYPE_PER_DAY})`,
          }),
        );
        continue;
      }

      existing.studentId = studentId;
      existing.instructorId = instructorId;
      existing.classTypeId = classTypeId;
      existing.startTime = startTime;
      existing.endTime = endTime;
      existing.status = "active";
      await existing.save();

      results.push(
        okResult({
          rowIndex: i,
          action,
          registrationId: existing.registrationId,
          message: "Updated",
        }),
      );
    } catch (err) {
      results.push(
        errResult({
          rowIndex: i,
          action,
          message: err?.message || "Server error while processing row",
        }),
      );
    }
  }

  return results;
}

module.exports = { processRegistrations };
