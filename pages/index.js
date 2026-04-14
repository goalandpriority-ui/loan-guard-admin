"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {

  const [user, setUser] = useState(null);

  const [apps, setApps] = useState([]);
  const [reports, setReports] = useState([]);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [risk, setRisk] = useState("low");

  const [search, setSearch] = useState("");

  /* =========================
     🔐 AUTH CHECK
  ========================= */
  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google"
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  /* =========================
     📊 DATA FETCH
  ========================= */
  useEffect(() => {
    if (user) {
      fetchApps();
      fetchReports();
    }
  }, [user]);

  async function fetchApps() {
    const { data } = await supabase.from("apps").select("*");
    setApps(data || []);
  }

  async function fetchReports() {
    const { data } = await supabase.from("reports").select("*");
    setReports(data || []);
  }

  async function addApp() {
    if (!name || !link) return alert("Fill all fields");

    await supabase.from("apps").insert([
      {
        name,
        link,
        risk,
        rating: 4,
        min_score: 600
      }
    ]);

    setName("");
    setLink("");
    setRisk("low");

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

  /* 🔥 STATS */
  const totalApps = apps.length;
  const highRiskApps = apps.filter(a => a.risk === "high").length;
  const totalReports = reports.length;

  /* 🔍 SEARCH FILTER */
  const filteredApps = apps.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================
     🔐 LOGIN SCREEN
  ========================= */
  if (!user) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#020617",
        color: "#fff",
        flexDirection: "column"
      }}>
        <h1 style={{ color: "#22c55e" }}>🔥 Loan Guard Admin</h1>
        <button
          onClick={loginWithGoogle}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Continue with Google 🚀
        </button>
      </div>
    );
  }

  /* =========================
     🔥 MAIN ADMIN UI
  ========================= */
  return (
    <div style={{ padding: 20, background: "#020617", minHeight: "100vh", color: "#fff" }}>
      
      <h1 style={{ color: "#22c55e" }}>🔥 Loan Guard Admin</h1>

      {/* 👤 USER */}
      <div style={{ marginTop: 10 }}>
        <p>👤 {user.email}</p>
        <button onClick={logout}>Logout</button>
      </div>

      {/* 📊 STATS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div>📱 Apps: {totalApps}</div>
        <div>🚨 High Risk: {highRiskApps}</div>
        <div>📢 Reports: {totalReports}</div>
      </div>

      {/* ➕ ADD APP */}
      <div style={{ marginTop: 30 }}>
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

        <select value={risk} onChange={e => setRisk(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button onClick={addApp}>Add</button>
      </div>

      {/* 🔍 SEARCH */}
      <div style={{ marginTop: 30 }}>
        <input
          placeholder="Search apps..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 10, width: "100%" }}
        />
      </div>

      {/* 📱 APPS */}
      <div style={{ marginTop: 30 }}>
        <h2>Apps</h2>

        {filteredApps.map(app => (
          <div
            key={app.id}
            style={{
              background: app.risk === "high" ? "#7f1d1d" : "#111",
              padding: 10,
              marginTop: 10,
              borderRadius: 8
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
              marginTop: 10,
              borderRadius: 8
            }}
          >
            <p><b>{r.app_name}</b></p>
            <p>{r.reason}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
