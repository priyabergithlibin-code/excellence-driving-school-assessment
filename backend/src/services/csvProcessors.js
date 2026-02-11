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

function normalizeRegistrationRow(row) {
  const action = cleanValue(row["Action"])?.toLowerCase();

  const registrationId = cleanValue(row["Registration ID"]);
  const studentId = cleanValue(row["Student ID"]);
  const instructorId = cleanValue(row["Instructor ID"]);
  const classId = cleanValue(row["Class ID"]);
  const startAt = parseMDY_HM(row["Class Start Time"]);

  return { action, registrationId, studentId, instructorId, classId, startAt };
}

module.exports = {
  cleanValue,
  parseMDY_HM,
  normalizeRegistrationRow,
};
