import { useEffect, useState } from "react";
import UploadCard from "../components/UploadCard";
import MetricsCard from "../components/MetricsCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Dashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  // used to re-trigger metrics reload after upload
  const [metricsRefreshKey, setMetricsRefreshKey] = useState(0);

  // optional: smooth progress animation while waiting (backend doesn't stream progress)
  useEffect(() => {
    if (!isUploading) return;

    setUploadPct(10);
    const t = setInterval(() => {
      setUploadPct((p) => (p >= 90 ? p : p + 5));
    }, 250);

    return () => clearInterval(t);
  }, [isUploading]);

  async function handleUpload(file) {
    setIsUploading(true);
    setUploadPct(0);
    setUploadFileName(file?.name || "");
    setUploadError("");
    setUploadResult(null);

    try {
      const form = new FormData();
      form.append("file", file); // backend expects field name: 'file'

      const res = await fetch(`${API_BASE}/api/registrations/upload`, {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.message || data?.error || `Upload failed (HTTP ${res.status})`;
        throw new Error(msg);
      }

      setUploadPct(100);
      setUploadResult(data);

      // refresh metrics after successful upload
      setMetricsRefreshKey((k) => k + 1);

      return data;
    } catch (err) {
      setUploadError(err?.message || "Something went wrong during upload.");
      throw err;
    } finally {
      // small delay to let user see 100%
      setTimeout(() => {
        setIsUploading(false);
        setUploadPct((p) => (p === 100 ? 100 : 0));
      }, 400);
    }
  }

  return (
    <div className="grid2">
      <div className="card">
        <h2 className="cardTitle">Upload Class Schedules</h2>

        <UploadCard
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadPct={uploadPct}
          uploadFileName={uploadFileName}
          uploadError={uploadError}
          uploadResult={uploadResult}
        />
      </div>

      <div className="card">
        <h2 className="cardTitle">Real-time Metrics</h2>
        <p className="cardSub">Scheduled Classes Per Day</p>

        {/* If your MetricsCard supports refreshKey, pass it; otherwise still renders fine */}
        <MetricsCard refreshKey={metricsRefreshKey} />
      </div>
    </div>
  );
}
