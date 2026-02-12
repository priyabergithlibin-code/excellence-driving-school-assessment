export default function ReportsCard({
  rows = [],
  error = "",
  filters = { from: "", to: "", instructor: "All" },
  instructors = ["All"],
  onChangeFilters = () => {},
  onApplyFilters = () => {},
}) {
  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="cardHeaderRow">
        <div className="filtersRow">
          <label className="label">
            From
            <input
              type="date"
              className="input"
              value={filters.from || ""}
              onChange={(e) =>
                onChangeFilters({ ...filters, from: e.target.value })
              }
            />
          </label>

          <label className="label">
            To Date
            <input
              type="date"
              className="input"
              value={filters.to || ""}
              onChange={(e) =>
                onChangeFilters({ ...filters, to: e.target.value })
              }
            />
          </label>

          <label className="label">
            Instructor
            <select
              className="input"
              value={filters.instructor || "All"}
              onChange={(e) =>
                onChangeFilters({ ...filters, instructor: e.target.value })
              }
            >
              {instructors.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button className="btn primary" type="button" onClick={onApplyFilters}>
          Filter
        </button>
      </div>

      {error ? <div className="warn small">{error}</div> : null}

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th style={{ width: 120 }}>Date</th>
              <th>Class Type</th>
              <th style={{ width: 160 }}>Instructor</th>
              <th style={{ width: 140 }}>Scheduled Time</th>
              <th style={{ width: 160 }}>Duration (mins)</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted small">
                  No reports found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.date}</td>
                  <td>{r.classType}</td>
                  <td>{r.instructor}</td>
                  <td>{r.time}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === "Scheduled" ? "ok" : "pending"
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="muted small" style={{ marginLeft: 10 }}>
                      {r.duration ?? "-"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
