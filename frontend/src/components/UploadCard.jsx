import { useRef, useState } from "react";

export default function UploadCard({
  onUpload,
  uploadPct = 0,
  uploadFileName = "",
  uploadError,
  uploadResult,
  isUploading = false,
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);

  function choose() {
    inputRef.current?.click();
  }

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  }

  async function upload() {
    if (!file || isUploading) return;
    await onUpload(file);
  }

  return (
    <div className="card">
      <div className="row gap">
        <button className="btn primary" type="button" onClick={choose}>
          Choose CSV File...
        </button>

        <button
          className="btn"
          type="button"
          onClick={upload}
          disabled={!file || isUploading}
        >
          {isUploading ? "Processing..." : "Upload & Process"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={onPick}
        />
      </div>

      <div className="muted small" style={{ marginTop: 10 }}>
        {file ? `Selected: ${file.name}` : "No file selected"}
      </div>

      {isUploading && (
        <div className="progressWrap">
          <div className="muted small">
            Processing: {uploadFileName || file?.name || "-"}
          </div>

          <div className="progressBar">
            <div className="progressFill" style={{ width: `${uploadPct}%` }} />
          </div>

          <div className="pct">{uploadPct}%</div>
        </div>
      )}

      {uploadError ? <div className="error">{uploadError}</div> : null}

      {uploadResult ? (
        <div className="resultBox">
          <div className="muted small">Last upload result:</div>
          <pre className="pre">{JSON.stringify(uploadResult, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
