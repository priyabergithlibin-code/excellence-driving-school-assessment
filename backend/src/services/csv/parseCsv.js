const { parse } = require("csv-parse");

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    parse(
      buffer,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      },
      (err, records) => {
        if (err) return reject(err);
        resolve(records);
      },
    );
  });
}

module.exports = { parseCsvBuffer };
