"use client";
// components/layout/NotificationsDropdown.tsx

import { useState, useEffect, useRef } from "react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const TYPE_EMOJI: Record<string, string> = {
  expense:        "🧾",
  payment:        "💸",
  friend_request: "🤝",
  settlement:     "✅",
};

export default function NotificationsDropdown() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch on mount and every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {}
  };

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!open && unreadCount > 0) {
      // Mark all as read
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        style={{ position: "relative", background: "none", border: "none", color: open ? "#fff" : "#A1A1AA", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", transition: "color 0.15s" }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, background: "#FF4F79", borderRadius: "50%", border: "2px solid #0B0B1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", padding: "0 3px" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 12px)", right: 0,
          width: 340, maxHeight: 420,
          background: "#17172B", borderRadius: 14,
          border: "0.5px solid rgba(255,255,255,0.1)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          zIndex: 200, overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
          animation: "dropIn 0.15s ease",
        }}>
          <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>Notifications</span>
            {notifications.length > 0 && (
              <button onClick={async () => { await fetch("/api/notifications", { method: "PATCH" }); setUnreadCount(0); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }}
                style={{ fontSize: 11, color: "#FF4F79", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", maxHeight: 360 }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
                <div style={{ fontSize: 13, color: "#A1A1AA" }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={n.id} style={{
                  display: "flex", gap: 12, padding: "12px 16px",
                  borderBottom: i < notifications.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none",
                  background: n.isRead ? "transparent" : "rgba(255,79,121,0.04)",
                  cursor: "pointer",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,79,121,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {TYPE_EMOJI[n.type] ?? "🔔"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 11.5, color: "#A1A1AA", marginBottom: 4 }}>{n.body}</div>
                    <div style={{ fontSize: 10, color: "#444466" }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF4F79", flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}