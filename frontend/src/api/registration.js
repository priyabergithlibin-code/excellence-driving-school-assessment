import { api } from "./client";

export async function uploadCsv(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/api/registrations/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      const pct = Math.round((evt.loaded * 100) / evt.total);
      onProgress?.(pct);
    },
  });

  return res.data;
}
