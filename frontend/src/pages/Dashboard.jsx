import { useEffect, useState } from "react";
import UploadCard from "../components/UploadCard";
import MetricsCard from "../components/MetricsCard";
import { uploadCsv } from "../api/registration";

export default function Dashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const [metricsRefreshKey, setMetricsRefreshKey] = useState(0);

  useEffect(() => {
    if (!isUploading) return;

    let t = null;

    setUploadPct((p) => (p > 0 ? p : 10));
    t = setInterval(() => {
      setUploadPct((p) => (p >= 90 ? p : p + 5));
    }, 250);

    return () => {
      if (t) clearInterval(t);
    };
  }, [isUploading]);

  async function handleUpload(file) {
    if (!file) return;

    setIsUploading(true);
    setUploadPct(0);
    setUploadFileName(file?.name || "");
    setUploadError("");
    setUploadResult(null);

    try {
      const data = await uploadCsv(file, (pct) => {
        setUploadPct((prev) => (pct >= 100 ? Math.max(prev, 99) : pct));
      });

      setUploadPct(100);
      setUploadResult(data);
      setMetricsRefreshKey((k) => k + 1);

      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong during upload.";

      setUploadError(msg);
      setUploadPct(0);
      throw err;
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 300);
    }
  }

  return (
    <div className="dashboardGrid">
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
        <h2 className="cardTitle">Scheduled Classes Overview</h2>
        <p className="cardSub">Scheduled Classes Per Day</p>
        <MetricsCard refreshKey={metricsRefreshKey} />
      </div>
    </div>
  );
}
