import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MetricsCard({ metrics = [] }) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="muted small metricsEmpty">No metrics data available.</div>
    );
  }

  return (
    <div className="metricsChart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={metrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00e6a8"
            strokeWidth={3}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
