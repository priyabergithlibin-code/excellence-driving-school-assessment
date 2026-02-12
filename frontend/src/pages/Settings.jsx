import { useEffect, useState } from "react";
import ConfigCard from "../components/ConfigCard";
import { getConfig, saveConfig, resetConfig } from "../api/config";

const EMPTY = {
  MAX_CLASSES_PER_STUDENT_PER_DAY: "",
  MAX_CLASSES_PER_INSTRUCTOR_PER_DAY: "",
  CLASS_DURATION_MINUTES: "",
  MAX_CLASSES_PER_CLASSTYPE_PER_DAY: "",
};

export default function Settings() {
  const [config, setConfig] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setStatus("");
      setLoading(true);
      const data = await getConfig();
      setConfig(data || EMPTY);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load config",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(draft) {
    try {
      setError("");
      setStatus("");
      setSaving(true);

      // normalize to numbers (backend also validates)
      const payload = {
        MAX_CLASSES_PER_STUDENT_PER_DAY: Number(
          draft.MAX_CLASSES_PER_STUDENT_PER_DAY,
        ),
        MAX_CLASSES_PER_INSTRUCTOR_PER_DAY: Number(
          draft.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY,
        ),
        CLASS_DURATION_MINUTES: Number(draft.CLASS_DURATION_MINUTES),
        MAX_CLASSES_PER_CLASSTYPE_PER_DAY: Number(
          draft.MAX_CLASSES_PER_CLASSTYPE_PER_DAY,
        ),
      };

      const updated = await saveConfig(payload);
      setConfig(updated);
      setStatus("Saved successfully");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    try {
      setError("");
      setStatus("");
      setSaving(true);
      await resetConfig();
      await load();
      setStatus("Reset to defaults");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Reset failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="muted">Loading configuration…</div>;
  }

  return (
    <div>
      {error ? (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="muted" style={{ color: "#ffb4b4" }}>
            {error}
          </div>
        </div>
      ) : null}

      <ConfigCard
        config={config}
        status={saving ? "Saving…" : status}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
}
