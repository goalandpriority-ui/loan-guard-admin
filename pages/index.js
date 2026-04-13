import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [apps, setApps] = useState([]);
  const [reports, setReports] = useState([]);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [risk, setRisk] = useState("low");

  useEffect(() => {
    fetchApps();
    fetchReports();
  }, []);

  async function fetchApps() {
    const { data } = await supabase.from("apps").select("*");
    setApps(data || []);
  }

  async function fetchReports() {
    const { data } = await supabase.from("reports").select("*");
    setReports(data || []);
  }

  async function addApp() {
    await supabase.from("apps").insert([
      {
        name,
        link,
        risk,
        rating: 4,
        min_score: 600
      }
    ]);
    fetchApps();
  }

  async function deleteApp(id) {
    await supabase.from("apps").delete().eq("id", id);
    fetchApps();
  }

  async function markScam(id) {
    await supabase.from("apps").update({ risk: "high" }).eq("id", id);
    fetchApps();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🔥 Loan Guard Admin</h1>

      {/* ➕ ADD APP */}
      <div style={{ marginTop: 20 }}>
        <h2>Add App</h2>

        <input
          placeholder="App Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          placeholder="App Link"
          value={link}
          onChange={e => setLink(e.target.value)}
        />

        <select onChange={e => setRisk(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button onClick={addApp}>Add</button>
      </div>

      {/* 📱 APPS */}
      <div style={{ marginTop: 30 }}>
        <h2>Apps</h2>

        {apps.map(app => (
          <div
            key={app.id}
            style={{
              background: "#111",
              padding: 10,
              marginTop: 10
            }}
          >
            <h3>{app.name}</h3>
            <p>Risk: {app.risk}</p>

            <button onClick={() => deleteApp(app.id)}>Delete</button>
            <button onClick={() => markScam(app.id)}>
              Mark as Scam
            </button>
          </div>
        ))}
      </div>

      {/* 🚨 REPORTS */}
      <div style={{ marginTop: 30 }}>
        <h2>User Reports</h2>

        {reports.map(r => (
          <div
            key={r.id}
            style={{
              background: "#111",
              padding: 10,
              marginTop: 10
            }}
          >
            <p>{r.app_name}</p>
            <p>{r.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
  }
