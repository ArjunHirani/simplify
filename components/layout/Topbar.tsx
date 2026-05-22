"use client";
// components/layout/Topbar.tsx

import { useAuthStore } from "@/store/authStore";
import NotificationsDropdown from "@/components/layout/NotificationsDropdown";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Topbar() {
  const { user } = useAuthStore();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const initials  = user?.fullName
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  return (
    <header style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 28px 14px",
      borderBottom: "0.5px solid rgba(255,255,255,0.07)",
      background: "#0B0B1A",
      fontFamily: "'DM Sans', sans-serif",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 2px", letterSpacing: "-0.3px" }}>
          {getGreeting()}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 13, color: "#A1A1AA", margin: 0 }}>
          Here&apos;s your expense overview
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Real notifications dropdown */}
        <NotificationsDropdown />

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #FF4F79, #ff8c6b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600, color: "#fff",
          cursor: "pointer", flexShrink: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {initials}
        </div>
      </div>
    </header>
  );
}