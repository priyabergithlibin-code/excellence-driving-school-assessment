import { useMemo, useState } from "react";
import { fetchClassReports } from "../api/report";

function toDDMMYYYY(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const [y, m, d] = yyyyMmDd.split("-");
  if (!y || !m || !d) return yyyyMmDd;
  return `${d}-${m}-${y}`;
}

function toBackendYYYYMMDD(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [d, m, y] = value.split("-");
    return `${y}-${m}-${d}`;
  }
  return value;
}

export default function ReportsCard({
  initialFilters = { from: "", to: "", instructor: "All" },
}) {
  const [filters, setFilters] = useState(initialFilters);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const instructorOptions = useMemo(() => {
    const ids = new Set();
    for (const r of rows) {
      if (r?.instructor) ids.add(String(r.instructor));
    }
    return ["All", ...Array.from(ids).sort()];
  }, [rows]);

  const isInvalidRange = useMemo(() => {
    if (!filters.from || !filters.to) return false;
    return (
      new Date(toBackendYYYYMMDD(filters.from)) >
      new Date(toBackendYYYYMMDD(filters.to))
    );
  }, [filters.from, filters.to]);

  async function applyFilters() {
    if (isInvalidRange) {
      setError("From date cannot be after To date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        from: toBackendYYYYMMDD(filters.from),
        to: toBackendYYYYMMDD(filters.to),
        instructor: filters.instructor || "All",
      };

      const res = await fetchClassReports(payload);

      const data = res?.data || [];
      const mapped = data.map((r) => ({
        id: r.id,
        studentId: r.studentId ?? "-",
        date: r.date,
        classType: r.classType,
        instructor: r.instructor,
        scheduledTime: r.scheduledTime,
        durationMins: r.durationMins,
      }));

      setRows(mapped);

      const hasSelected =
        filters.instructor === "All" ||
        mapped.some((x) => String(x.instructor) === String(filters.instructor));
      if (!hasSelected) {
        setFilters((prev) => ({ ...prev, instructor: "All" }));
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to load reports.";
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="cardHeaderRow">
        <div className="filtersRow">
          <label className="label">
            From
            <input
              type="date"
              className="input"
              value={toBackendYYYYMMDD(filters.from)}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
            />
            <div className="muted small">{toDDMMYYYY(filters.from)}</div>
          </label>

          <label className="label">
            To Date
            <input
              type="date"
              className="input"
              value={toBackendYYYYMMDD(filters.to)}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
            />
            <div className="muted small">{toDDMMYYYY(filters.to)}</div>
          </label>

          <label className="label">
            Instructor
            <select
              className="input"
              value={filters.instructor}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, instructor: e.target.value }))
              }
            >
              {instructorOptions.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <div className="muted small">
              {rows.length
                ? `${instructorOptions.length - 1} instructors`
                : "Load data to see instructors"}
            </div>
          </label>
        </div>

        <button
          className="btn uploadSubmit readyUpload"
          type="button"
          onClick={applyFilters}
          disabled={loading}
          title={isInvalidRange ? "Fix date range first" : "Apply filters"}
        >
          {loading ? "Filtering..." : "Filter"}
        </button>
      </div>

      {isInvalidRange ? (
        <div className="warn small">From date cannot be after To date.</div>
      ) : null}

      {error ? <div className="warn small">{error}</div> : null}

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th style={{ width: 110 }}>Student</th>
              <th style={{ width: 120 }}>Date</th>
              <th>Class Type</th>
              <th style={{ width: 160 }}>Instructor</th>
              <th style={{ width: 140 }}>Scheduled Time</th>
              <th style={{ width: 160 }}>Duration (mins)</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="muted small">
                  Loading reports...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="muted small">
                  No reports found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.studentId}</td>
                  <td>{toDDMMYYYY(r.date)}</td>
                  <td>{r.classType}</td>
                  <td>{r.instructor}</td>
                  <td>{r.scheduledTime || "-"}</td>
                  <td>{r.durationMins ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="muted small" style={{ marginTop: 10 }}>
        Showing {rows.length} result{rows.length === 1 ? "" : "s"}.
      </div>
    </div>
  );
}
