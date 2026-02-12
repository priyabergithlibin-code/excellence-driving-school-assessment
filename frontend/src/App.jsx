import { useState } from "react";
import TopNav from "./components/TopNav";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="app">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container">
        {activeTab === "Dashboard" && <Dashboard />}
        {activeTab === "Reports" && <Reports />}
        {activeTab === "Settings" && <Settings />}
      </main>
    </div>
  );
}
