import { api } from "./client";

export async function fetchClassReports({ from, to, instructor }) {
  const res = await api.get(`/api/reports/class-reports`, {
    params: { from, to, instructor },
  });

  return res.data;
}
