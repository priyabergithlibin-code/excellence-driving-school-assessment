import { api } from "./client";

export async function fetchClassReports({ from, to, instructor }) {
  console.log("from, to, instructor", from, to, instructor);
  const res = await api.get(`/api/reports/class-reports`, {
    params: { from, to, instructor },
  });
  console.log("Data", res.data);
  return res.data;
}
