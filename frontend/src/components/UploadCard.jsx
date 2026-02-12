import { useRef, useState } from "react";

export default function UploadCard({
  onUpload,
  uploadPct = 0,
  uploadFileName = "",
  uploadError = "",
  uploadResult = null,
  isUploading = false,
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);

  function choose() {
    if (isUploading) return;
    inputRef.current?.click();
  }

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    const name = f.name?.toLowerCase() || "";
    const type = f.type || "";

    const isCsv =
      name.endsWith(".csv") ||
      type === "text/csv" ||
      type === "application/vnd.ms-excel";

    if (!isCsv) {
      alert("Please select a valid CSV file.");
      e.target.value = "";
      return;
    }

    setFile(f);

    // allow picking the same file again
    e.target.value = "";
  }

  async function upload() {
    if (!file || isUploading) return;

    if (typeof onUpload !== "function") {
      console.error("UploadCard: onUpload prop is not a function.", onUpload);
      alert(
        "Upload handler is not connected. Please pass onUpload as a function from the parent component.",
      );
      return;
    }

    try {
      await onUpload(file);

      // Parent should clear uploadError when success,
      // but we also clear selection if there is no error currently.
      if (!uploadError) {
        setFile(null);
      }
    } catch (err) {
      console.error("UploadCard: upload failed", err);
      // Don't clear file on failure; let user retry
    }
  }

  const disabledChoose = isUploading;
  const disabledUpload = !file || isUploading;

  return (
    <div>
      <div className="row gap">
        <button
          className="btn primary"
          type="button"
          onClick={choose}
          disabled={disabledChoose}
        >
          Choose CSV File...
        </button>

        <button
          className={`btn ${file && !isUploading ? "readyUpload" : ""}`}
          type="button"
          onClick={upload}
          disabled={disabledUpload}
          title={!file ? "Select a CSV file first" : ""}
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
        {file
          ? `Selected: ${file.name}`
          : "Choose a CSV file to enable upload."}
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

      {!!uploadError && <div className="error">{uploadError}</div>}

      {!!uploadResult && (
        <div className="resultBox">
          <div className="muted small">CSV Upload Completed</div>

          <div className="summaryBox">
            <div>Total Rows: {uploadResult?.count || 0}</div>
            <div>
              Successful:{" "}
              {
                (uploadResult?.results || []).filter(
                  (r) => r.status === "success",
                ).length
              }
            </div>
            <div>
              Failed:{" "}
              {
                (uploadResult?.results || []).filter(
                  (r) => r.status !== "success",
                ).length
              }
            </div>
          </div>

          <div className="resultScroll">
            <ul className="resultList">
              {(uploadResult?.results || []).map((r, idx) => {
                const id = r.registrationId ?? "N/A";
                const action = (r.action || "").toLowerCase();

                let verb = "processed";
                if (action === "new") verb = "created";
                else if (action === "update") verb = "updated";
                else if (action === "delete") verb = "canceled";

                return (
                  <li
                    key={`${r.row ?? idx}-${idx}`}
                    className={r.status === "success" ? "ok" : "bad"}
                  >
                    {r.status === "success"
                      ? `Registration ID ${id} has been ${verb} successfully.`
                      : `Row ${r.row ?? idx} was rejected — ${
                          r.message || "Unknown error."
                        }`}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
