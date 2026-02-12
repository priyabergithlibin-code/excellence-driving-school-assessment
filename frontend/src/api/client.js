import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});
