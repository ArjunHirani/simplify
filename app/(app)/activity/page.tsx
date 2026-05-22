"use client";
// app/(app)/activity/page.tsx

import { useState, useEffect } from "react";

type Filter = "all" | "expense" | "settlement";

interface ActivityItem {
  id: string;
  type: string;
  emoji: string;
  emojiColor: string;
  title: string;
  description: string;
  amount: number;
  timestamp: string;
}

export default function ActivityPage() {
  const [items,   setItems]   = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/activity?filter=${filter}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setItems(d.activities ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError("Failed to load activity."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [filter]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",        label: "All" },
    { key: "expense",    label: "Expenses" },
    { key: "settlement", label: "Settlements" },
  ];

  return (
    <>
      <style>{`
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .activity-row:hover { background: rgba(255,255,255,0.02) !important; }
        .filter-btn:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>

      <div style={{ maxWidth: 700, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Activity</h1>
          <p style={{ fontSize: 13, color: "#A1A1AA", margin: 0 }}>Your complete expense timeline</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className="filter-btn"
              onClick={() => setFilter(key)}
              style={{
                fontSize: 12, fontWeight: 500,
                padding: "6px 16px", borderRadius: 20, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                border: filter === key ? "0.5px solid rgba(255,79,121,0.4)" : "0.5px solid rgba(255,255,255,0.1)",
                background: filter === key ? "rgba(255,79,121,0.15)" : "transparent",
                color: filter === key ? "#FF4F79" : "#A1A1AA",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 12, padding: 16, color: "#FF6B6B", fontSize: 13, marginBottom: 20 }}>{error}</div>
        )}

        {/* Activity list */}
        <div style={{ background: "#17172B", borderRadius: 14, border: "0.5px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>

          {loading && (
            <div style={{ padding: "8px 0" }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <div className="skeleton" style={{ height: 13, width: "55%" }} />
                    <div className="skeleton" style={{ height: 11, width: "40%" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <div className="skeleton" style={{ height: 13, width: 70 }} />
                    <div className="skeleton" style={{ height: 10, width: 50 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🕐</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>No activity yet</div>
              <div style={{ fontSize: 13, color: "#A1A1AA" }}>
                {filter === "all" ? "Add expenses or settle debts to see your timeline." : `No ${filter}s found.`}
              </div>
            </div>
          )}

          {!loading && items.map((item, i) => {
            const isPositive = item.amount >= 0;
            const amtColor   = isPositive ? "#4ADE80" : "#FF6B6B";
            const amtStr     = `${isPositive ? "+" : ""}₹${Math.abs(item.amount).toLocaleString("en-IN")}`;
            const isLast     = i === items.length - 1;

            return (
              <div
                key={item.id}
                className="activity-row"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 18px",
                  borderBottom: isLast ? "none" : "0.5px solid rgba(255,255,255,0.04)",
                  cursor: "pointer", transition: "background 0.1s",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: item.emojiColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, flexShrink: 0,
                }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 11.5, color: "#A1A1AA" }}>{item.description}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: amtColor }}>
                    {amtStr}
                  </div>
                  <div style={{ fontSize: 10, color: "#444466", marginTop: 3 }}>{item.timestamp}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}