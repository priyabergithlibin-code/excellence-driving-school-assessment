const Registration = require("../models/Registration");

function toDateOnly(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function toHHmm(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function parseDateInput(v) {
  if (!v) return null;
  const dt = new Date(v); // expects YYYY-MM-DD from frontend
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

async function getClassReports(req, res, next) {
  try {
    const { from, to, instructor } = req.query;
    const filter = { status: "active" };
    const fromDate = parseDateInput(from);
    const toDate = parseDateInput(to);

    if (fromDate || toDate) {
      filter.startTime = {};
      if (fromDate) filter.startTime.$gte = fromDate;

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.startTime.$lte = end;
      }
    }

    if (instructor && instructor !== "All") {
      filter.instructorId = String(instructor);
    }

    const rows = await Registration.find(filter).sort({ startTime: -1 }).lean();

    const data = rows.map((r) => {
      const start = r.startTime ? new Date(r.startTime) : null;
      const endT = r.endTime ? new Date(r.endTime) : null;

      const durationMins =
        start && endT
          ? Math.max(0, Math.round((endT.getTime() - start.getTime()) / 60000))
          : null;

      return {
        id: r.registrationId ?? r._id,
        studentId: r.studentId ?? null,
        instructor: r.instructorId ?? null,
        classType: r.classTypeId ?? null,
        date: start ? toDateOnly(start) : null,
        scheduledTime: start ? toHHmm(start) : null,
        durationMins,
        status: r.status ?? null,
      };
    });

    res.json({ ok: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getClassReports };
