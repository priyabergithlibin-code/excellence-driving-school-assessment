import UploadCard from "../components/UploadCard";
import MetricsCard from "../components/MetricsCard";

export default function Dashboard() {
  return (
    <div className="grid2">
      <div className="card">
        <h2 className="cardTitle">Upload Class Schedules</h2>
        <UploadCard />
      </div>

      <div className="card">
        <h2 className="cardTitle">Real-time Metrics</h2>
        <p className="cardSub">Scheduled Classes Per Day</p>
        <MetricsCard />
      </div>
    </div>
  );
}
