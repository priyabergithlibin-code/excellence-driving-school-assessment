import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// CSV upload
export async function uploadCsv(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/api/registrations/upload-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      const pct = Math.round((evt.loaded * 100) / evt.total);
      onProgress?.(pct);
    },
  });

  return res.data;
}
