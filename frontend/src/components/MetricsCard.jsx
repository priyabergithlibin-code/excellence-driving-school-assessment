import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { fetchMetrics } from "../api/metric";

function toInputDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatAxisDate(yyyyMmDd) {
  const [y, m, d] = String(yyyyMmDd).split("-").map(Number);
  if (!y || !m || !d) return yyyyMmDd;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function formatFullDate(yyyyMmDd) {
  const [y, m, d] = String(yyyyMmDd).split("-").map(Number);
  if (!y || !m || !d) return yyyyMmDd;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MetricsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const count = payload?.[0]?.value ?? 0;

  return (
    <div
      style={{
        background: "rgba(18, 26, 38, 0.95)",
        border: "1px solid rgba(0, 230, 168, 0.35)",
        borderRadius: 12,
        padding: "10px 12px",
        color: "#e6f1ff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        minWidth: 190,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
        {formatFullDate(label)}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#00e6a8" }}>
        No. of Classes: {count}
      </div>
    </div>
  );
}

export default function MetricsCard({ refreshKey }) {
  const [metrics, setMetrics] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [err, setErr] = useState("");

  const [to, setTo] = useState(() => toInputDate(new Date()));
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return toInputDate(d);
  });

  const aliveRef = useRef(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    let timer;

    async function load({ initial = false } = {}) {
      try {
        if (initial && !hasLoadedRef.current) {
          setInitialLoading(true);
        } else {
          setUpdating(true);
        }

        const res = await fetchMetrics({ from, to });
        const rows = res?.data ?? [];

        const mapped = rows.map((r) => ({
          date: r.date,
          count: r.count ?? 0,
        }));

        if (aliveRef.current) {
          setMetrics(mapped);
          setErr("");
          hasLoadedRef.current = true;
        }
      } catch (e) {
        if (aliveRef.current) {
          setErr(e?.message || "Failed to load metrics");
        }
      } finally {
        if (aliveRef.current) {
          if (initial) setInitialLoading(false);
          setUpdating(false);
        }
      }
    }

    load({ initial: !hasLoadedRef.current });
    timer = setInterval(() => load({ initial: false }), 5000);

    return () => clearInterval(timer);
  }, [refreshKey, from, to]);

  return (
    <div>
      <div
        className="dateFilters"
        style={{ alignItems: "end", marginBottom: 12 }}
      >
        <div className="dateInput">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="dateLabel">From</span>
        </div>

        <div className="dateInput">
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
          <span className="dateLabel">To</span>
        </div>
      </div>

      {err && (
        <div
          className="muted small"
          style={{ color: "#ff6b6b", marginBottom: 8 }}
        >
          {err}
        </div>
      )}

      {initialLoading ? (
        <div className="muted small metricsEmpty">Loading metrics...</div>
      ) : (
        <div className="metricsChart" style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={metrics}
              margin={{ top: 20, right: 30, left: 30, bottom: 45 }}
            >
              <CartesianGrid strokeDasharray="4 4" opacity={0.15} />

              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tickMargin={10}
                minTickGap={20}
              >
                <Label
                  value="Date"
                  position="insideBottom"
                  offset={-10}
                  style={{ fill: "#8aa0b6", fontSize: 13 }}
                />
              </XAxis>

              <YAxis
                allowDecimals={false}
                tickMargin={10}
                domain={[0, (dataMax) => (dataMax === 0 ? 5 : dataMax + 1)]}
              >
                <Label
                  value="No. of Classes"
                  angle={-90}
                  position="insideLeft"
                  style={{
                    textAnchor: "middle",
                    fill: "#8aa0b6",
                    fontSize: 13,
                  }}
                />
              </YAxis>

              <Tooltip content={<MetricsTooltip />} />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#00e6a8"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
                isAnimationActive
                animationDuration={450}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>

          {updating && (
            <div
              style={{
                position: "absolute",
                right: 18,
                bottom: 10,
                fontSize: 12,
                color: "#9fb3c8",
                opacity: 0.9,
              }}
            >
              Refreshing...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
