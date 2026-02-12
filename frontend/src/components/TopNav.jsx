export default function TopNav({ activeTab, onTabChange }) {
  const tabs = ["Dashboard", "Reports", "Settings"];

  return (
    <div className="topnav">
      <div className="brand">
        <img src="/logo.png" alt="Elite Driving School" className="logo" />
        <span>Elite Driving School</span>
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

        <button className="profileBtn" type="button" title="Admin">
          <span className="profileCircle">A</span>
        </button>
      </div>
    </div>
  );
}
