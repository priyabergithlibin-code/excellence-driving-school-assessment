import { api } from "../api/client";

export async function getConfig() {
  const res = await api.get("/api/config");
  return res.data.config;
}

export async function saveConfig(payload) {
  const res = await api.put("/api/config", payload);
  return res.data.config;
}

export async function resetConfig() {
  const res = await api.post("/api/config/reset");
  return res.data;
}
