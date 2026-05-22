"use client";
// app/(app)/settings/page.tsx

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [upiId,    setUpiId]    = useState(user?.upiId ?? "");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    // TODO: wire to PATCH /api/user when profile API is built
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    clearAuth();
    router.push("/login");
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "#12121F", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, color: "#fff", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block" as const, fontSize: 12,
    fontWeight: 500 as const, color: "#A1A1AA", marginBottom: 6,
  };

  const sectionStyle = {
    background: "#17172B", borderRadius: 14,
    border: "0.5px solid rgba(255,255,255,0.07)",
    padding: "20px 24px", marginBottom: 16,
  };

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) ?? "U";

  return (
    <div style={{ maxWidth: 560, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#A1A1AA", margin: 0 }}>Manage your profile and preferences</p>
      </div>

      {/* Profile section */}
      <div style={sectionStyle}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 20px" }}>Profile</h2>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF4F79, #ff8c6b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, color: "#fff",
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{user?.fullName}</div>
            <div style={{ fontSize: 12, color: "#52526E" }}>{user?.email}</div>
          </div>
        </div>

        {error  && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FF6B6B", marginBottom: 16 }}>{error}</div>}
        {saved  && <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4ADE80", marginBottom: 16 }}>✓ Changes saved</div>}

        <form onSubmit={handleSave} noValidate>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full name</label>
            <input type="text" style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email address</label>
            <input type="email" style={{ ...inputStyle, opacity: 0.5 }} value={user?.email ?? ""} disabled />
            <p style={{ fontSize: 11, color: "#52526E", marginTop: 5 }}>Email cannot be changed.</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>UPI ID</label>
            <input type="text" style={inputStyle} placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
            <p style={{ fontSize: 11, color: "#52526E", marginTop: 5 }}>Friends will use this to pay you when settling up.</p>
          </div>
          <button type="submit" disabled={saving} style={{
            padding: "11px 24px", background: "#FF4F79", border: "none",
            borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div style={sectionStyle}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 16px" }}>Preferences</h2>
        {[
          { label: "Default currency", value: "INR — Indian Rupee" },
          { label: "Theme", value: "Dark (default)" },
          { label: "Notifications", value: "All enabled" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 13, color: "#A1A1AA" }}>{label}</span>
            <span style={{ fontSize: 13, color: "#fff" }}>{value}</span>
          </div>
        ))}
        <p style={{ fontSize: 11, color: "#52526E", marginTop: 12 }}>Full preferences editor coming in a future update.</p>
      </div>

      {/* Danger zone */}
      <div style={{ ...sectionStyle, border: "0.5px solid rgba(255,107,107,0.2)" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#FF6B6B", margin: "0 0 16px" }}>Account</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "11px 20px", background: "transparent",
              border: "0.5px solid rgba(255,107,107,0.3)",
              borderRadius: 10, color: "#FF6B6B",
              fontSize: 13, fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              textAlign: "left",
            }}
          >
            Log out of Simplify
          </button>
          <button
            style={{
              padding: "11px 20px", background: "transparent",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 10, color: "#52526E",
              fontSize: 13, fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              textAlign: "left",
            }}
          >
            Delete account (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}