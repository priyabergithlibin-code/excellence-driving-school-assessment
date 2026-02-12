import { useState } from "react";

export default function ConfigCard({ config, onSave, onReset, status }) {
  const [draft, setDraft] = useState(() => config || {});

  function setField(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleReset() {
    setDraft(config || {});
    onReset?.();
  }

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="cardHeaderRow">
        <div className="row gap">
          <button className="btn" type="button" onClick={handleReset}>
            Reset
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={() => onSave?.(draft)}
          >
            Save
          </button>
        </div>
      </div>

      <div className="configGrid">
        <label className="label">
          Max Student Classes Daily
          <input
            className="input"
            type="number"
            value={draft?.MAX_CLASSES_PER_STUDENT_PER_DAY ?? ""}
            onChange={(e) =>
              setField("MAX_CLASSES_PER_STUDENT_PER_DAY", e.target.value)
            }
          />
        </label>

        <label className="label">
          Max Instructor Classes Daily
          <input
            className="input"
            type="number"
            value={draft?.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY ?? ""}
            onChange={(e) =>
              setField("MAX_CLASSES_PER_INSTRUCTOR_PER_DAY", e.target.value)
            }
          />
        </label>

        <label className="label">
          Class Duration (mins)
          <input
            className="input"
            type="number"
            value={draft?.CLASS_DURATION_MINUTES ?? ""}
            onChange={(e) => setField("CLASS_DURATION_MINUTES", e.target.value)}
          />
        </label>

        <label className="label">
          Max Classes Per Type Daily
          <input
            className="input"
            type="number"
            value={draft?.MAX_CLASSES_PER_CLASSTYPE_PER_DAY ?? ""}
            onChange={(e) =>
              setField("MAX_CLASSES_PER_CLASSTYPE_PER_DAY", e.target.value)
            }
          />
        </label>
      </div>

      {status ? (
        <div className="muted small" style={{ marginTop: 10 }}>
          {status}
        </div>
      ) : null}
    </div>
  );
}
