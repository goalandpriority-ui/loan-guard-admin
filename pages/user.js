"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function UserApp() {

  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState("");
  const [reportText, setReportText] = useState("");

  /* 🔐 AUTH */
  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  }

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google"
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  /* 📊 FETCH APPS */
  useEffect(() => {
    if (user) fetchApps();
  }, [user]);

  async function fetchApps() {
    const { data } = await supabase.from("apps").select("*");
    setApps(data || []);
  }

  /* 🚨 REPORT */
  async function reportApp(appName) {
    if (!reportText) return alert("Enter reason");

    await supabase.from("reports").insert([
      {
        app_name: appName,
        reason: reportText
      }
    ]);

    setReportText("");
    alert("Reported 🚨");
  }

  /* 🔍 SEARCH */
  const filteredApps = apps.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  /* 🔐 LOGIN SCREEN */
  if (!user) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#020617",
        color: "#fff"
      }}>
        <h1 style={{ color: "#22c55e" }}>Loan Guard</h1>
        <button onClick={login}>Login with Google 🚀</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, background: "#020617", minHeight: "100vh", color: "#fff" }}>
      
      <h1 style={{ color: "#22c55e" }}>📱 Loan Apps</h1>

      <p>👤 {user.email}</p>
      <button onClick={logout}>Logout</button>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search apps..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: 10, width: "100%", marginTop: 20 }}
      />

      {/* 📱 APPS */}
      <div style={{ marginTop: 20 }}>
        {filteredApps.map(app => (
          <div
            key={app.id}
            style={{
              background: "#111",
              padding: 15,
              marginTop: 10,
              borderRadius: 10
            }}
          >
            <h3>{app.name}</h3>
            <p>Risk: {app.risk}</p>
            <p>⭐ Rating: {app.rating}</p>

            {/* 🚨 REPORT */}
            <input
              placeholder="Report reason..."
              value={reportText}
              onChange={e => setReportText(e.target.value)}
            />

            <button onClick={() => reportApp(app.name)}>
              Report 🚨
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
