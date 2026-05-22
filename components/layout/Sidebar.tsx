"use client";
// components/layout/Sidebar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { href: "/groups",    label: "Groups",    d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", badge: true },
  { href: "/friends",   label: "Friends",   d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { href: "/activity",  label: "Activity",  d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
];

export default function Sidebar() {
  const pathname            = usePathname();
  const router              = useRouter();
  const { user, clearAuth } = useAuthStore();

  const [balance,      setBalance]      = useState<number | null>(null);
  const [totalOwing,   setTotalOwing]   = useState(0);
  const [groupCount,   setGroupCount]   = useState(0);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(d => {
        if (d.summary) {
          setBalance(d.summary.totalOwed - d.summary.totalOwing);
          setTotalOwing(d.summary.totalOwing);
        }
      })
      .catch(() => {});

    fetch("/api/groups")
      .then(r => r.json())
      .then(d => { if (d.groups) setGroupCount(d.groups.length); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    clearAuth();
    router.push("/login");
  };

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) ?? "U";
  const balancePositive = balance === null ? true : balance >= 0;
  const balanceDisplay  = balance === null ? "..." : `${balancePositive ? "+" : ""}₹${Math.abs(balance).toLocaleString("en-IN")}`;

  return (
    <aside style={{
      width: 220, minWidth: 220, height: "100vh",
      background: "#17172B",
      borderRight: "0.5px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0,
      fontFamily: "'DM Sans', sans-serif",
      overflowY: "auto", overflowX: "hidden",
    }}>

      {/* Logo */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
          Simplify<span style={{ color: "#FF4F79" }}>.</span>
        </div>
      </div>

      {/* Balance */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 4 }}>Total balance</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: balancePositive ? "#4ADE80" : "#FF6B6B" }}>
          {balanceDisplay}
        </div>
      </div>

      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", marginBottom: 16 }} />

      {/* Nav */}
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "1.2px", color: "#444466", textTransform: "uppercase", padding: "0 20px 8px" }}>
        Menu
      </div>

      {NAV.map(({ href, label, d, badge }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={href} href={href} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px", fontSize: 13.5, fontWeight: active ? 500 : 400,
            color: active ? "#fff" : "#A1A1AA", textDecoration: "none",
            borderLeft: `2px solid ${active ? "#FF4F79" : "transparent"}`,
            background: active ? "rgba(255,79,121,0.07)" : "transparent",
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
              {d.split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}
            </svg>
            <span style={{ flex: 1 }}>{label}</span>
            {badge && groupCount > 0 && (
              <span style={{ background: "#FF4F79", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>
                {groupCount}
              </span>
            )}
          </Link>
        );
      })}

      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "16px 0" }} />

      {/* Settle up card */}
      {totalOwing > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "1.2px", color: "#444466", textTransform: "uppercase", padding: "0 20px 8px" }}>
            Settle up
          </div>
          <div style={{ margin: "0 12px 16px", background: "rgba(255,79,121,0.08)", border: "0.5px solid rgba(255,79,121,0.25)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 4 }}>You owe</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#FF6B6B" }}>
              ₹{totalOwing.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 10.5, color: "#A1A1AA", marginBottom: 10 }}>outstanding</div>
            <button style={{ width: "100%", padding: "8px", background: "#FF4F79", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              Settle All
            </button>
          </div>
        </>
      )}

      <div style={{ flex: 1, minHeight: 16 }} />

      {/* Settings */}
      <Link href="/settings" style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 20px", fontSize: 13.5,
        color: pathname === "/settings" ? "#fff" : "#A1A1AA",
        textDecoration: "none",
        borderLeft: `2px solid ${pathname === "/settings" ? "#FF4F79" : "transparent"}`,
        background: pathname === "/settings" ? "rgba(255,79,121,0.07)" : "transparent",
      }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Settings
      </Link>

      {/* User + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 16px", borderTop: "0.5px solid rgba(255,255,255,0.07)", marginTop: 4 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #FF4F79, #ff8c6b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.fullName ?? "User"}
          </div>
          <div style={{ fontSize: 10, color: "#52526E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.email ?? ""}
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          style={{ background: "none", border: "none", color: "#52526E", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", borderRadius: 6, flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#FF6B6B")}
          onMouseLeave={e => (e.currentTarget.style.color = "#52526E")}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}