const { parseCsvBuffer } = require("../services/csv/parseCsv");
const {
  processRegistrations,
} = require("../services/registrations/processRegistrations");

async function uploadCsv(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error("CSV file is required (field name must be 'file')");
      err.statusCode = 400;
      throw err;
    }
    const rows = await parseCsvBuffer(req.file.buffer);

    if (!rows.length) {
      return res.status(400).json({ ok: false, message: "CSV has no rows" });
    }

    const results = await processRegistrations(rows);
    res.json({
      ok: true,
      message: "CSV processed",
      count: rows.length,
      results,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { uploadCsv };
