import ConfigCard from "../components/ConfigCard";

export default function Settings() {
  return (
    <section className="card">
      <h2 className="cardTitle">Configuration</h2>
      <p className="cardSub">Update limits used while scheduling classes</p>
      <ConfigCard />
    </section>
  );
}
