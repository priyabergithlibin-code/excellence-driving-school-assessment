export default function TopNav({ activeTab, onTabChange }) {
  const tabs = ["Dashboard", "Reports", "Settings"]; // keep "Reports" consistent

  return (
    <div className="topnav">
      <div className="brand">
        <span className="brand-title">Excellence Driving School</span>
      </div>

      <div className="topnav-right">
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t}
              className={`tab ${activeTab === t ? "active" : ""}`}
              onClick={() => onTabChange(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Admin Profile Circle */}
        <button className="profileBtn" type="button" title="Admin">
          <span className="profileCircle">A</span>
        </button>
      </div>
    </div>
  );
}
