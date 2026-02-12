import { useState } from "react";

const toDraft = (config) => ({
  MAX_CLASSES_PER_STUDENT_PER_DAY:
    config?.MAX_CLASSES_PER_STUDENT_PER_DAY ?? "",
  MAX_CLASSES_PER_INSTRUCTOR_PER_DAY:
    config?.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY ?? "",
  CLASS_DURATION_MINUTES: config?.CLASS_DURATION_MINUTES ?? "",
  MAX_CLASSES_PER_CLASSTYPE_PER_DAY:
    config?.MAX_CLASSES_PER_CLASSTYPE_PER_DAY ?? "",
});

export default function ConfigCard({ config, onSave, onReset, status }) {
  const [draft, setDraft] = useState(() => toDraft(config));

  function setField(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleResetClick() {
    setDraft(toDraft(config));
    onReset?.();
  }

  return (
    <div className="configCard">
      <div className="configHeader">
        <h2>Configuration</h2>
        <p>Update limits used while scheduling classes</p>
      </div>

      <div className="configBody">
        <div className="formGroup">
          <label>Max Student Classes Daily</label>
          <input
            type="number"
            value={draft.MAX_CLASSES_PER_STUDENT_PER_DAY}
            onChange={(e) =>
              setField("MAX_CLASSES_PER_STUDENT_PER_DAY", e.target.value)
            }
          />
        </div>

        <div className="formGroup">
          <label>Max Instructor Classes Daily</label>
          <input
            type="number"
            value={draft.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY}
            onChange={(e) =>
              setField("MAX_CLASSES_PER_INSTRUCTOR_PER_DAY", e.target.value)
            }
          />
        </div>

        <div className="formGroup">
          <label>Class Duration (mins)</label>
          <input
            type="number"
            value={draft.CLASS_DURATION_MINUTES}
            onChange={(e) => setField("CLASS_DURATION_MINUTES", e.target.value)}
          />
        </div>

        <div className="formGroup">
          <label>Max Classes Per Type Daily</label>
          <input
            type="number"
            value={draft.MAX_CLASSES_PER_CLASSTYPE_PER_DAY}
            onChange={(e) =>
              setField("MAX_CLASSES_PER_CLASSTYPE_PER_DAY", e.target.value)
            }
          />
        </div>
      </div>

      <div className="configFooter">
        <div className="statusText">{status}</div>

        <div className="actions">
          <button
            className="btn secondary"
            type="button"
            onClick={handleResetClick}
          >
            Reset
          </button>
          <button
            className="btn uploadSubmit readyUpload"
            type="button"
            onClick={() => onSave?.(draft)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
