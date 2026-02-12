import { api } from "../api/client";

export async function fetchMetrics({ from, to } = {}) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const url = `/api/metrics/scheduled-classes-per-day${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const res = await api.get(url);
  return res.data;
}
