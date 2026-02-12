const Registration = require("../models/Registration");

function parseDateParam(v, fallback) {
  if (!v) return fallback;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function startOfDayUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDayUTC(d) {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function formatYYYYMMDDUTC(d) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function getScheduledClassesPerDay(req, res, next) {
  try {
    const now = new Date();
    const defaultTo = now;
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 13);

    const fromRaw = parseDateParam(req.query.from, defaultFrom);
    const toRaw = parseDateParam(req.query.to, defaultTo);

    const from = startOfDayUTC(fromRaw);
    const to = endOfDayUTC(toRaw);

    const dateField = "startTime";

    const rows = await Registration.aggregate([
      {
        $match: {
          [dateField]: { $gte: from, $lte: to },
          status: "active",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: `$${dateField}`,
              timezone: "UTC",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    const map = new Map(rows.map((r) => [r.date, r.count]));

    const result = [];
    const cursor = startOfDayUTC(from);
    const last = startOfDayUTC(to);

    while (cursor <= last) {
      const key = formatYYYYMMDDUTC(cursor);
      result.push({ date: key, count: map.get(key) ?? 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    res.json({
      ok: true,
      from: from.toISOString(),
      to: to.toISOString(),
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getScheduledClassesPerDay };
