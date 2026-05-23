"use client";
// app/(app)/groups/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  members: number;
  totalSpent: number;
  yourShare: number;
  netBalance: number;
  currency: string;
}

const EMOJIS = ["👥","🏠","✈️","🍕","🎉","💼","🏖️","🎮","🛒","💡","🏋️","🎵"];

export default function GroupsPage() {
  const router = useRouter();
  const [groups,     setGroups]     = useState<Group[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [tick,       setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/groups")
      .then(r => r.json())
      .then(d => { if (!cancelled) { setGroups(d.groups ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError("Failed to load groups."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [tick]);

  return (
    <>
      <style>{`
        .groups-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
        @media(max-width:700px){.groups-grid{grid-template-columns:1fr}}
        .group-card:hover{border-color:rgba(255,79,121,0.4) !important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
        .group-card{transition:all 0.15s !important}
        .skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.05) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      <div style={{ maxWidth: 900, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Groups</h1>
            <p style={{ fontSize: 13, color: "#A1A1AA", margin: 0 }}>
              {loading ? "Loading..." : `${groups.length} group${groups.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#FF4F79", border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(255,79,121,0.3)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New group
          </button>
        </div>

        {error && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 12, padding: 16, color: "#FF6B6B", fontSize: 13, marginBottom: 20 }}>{error}</div>}

        {/* Loading skeletons */}
        {loading && (
          <div className="groups-grid">
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: "#17172B", borderRadius: 14, padding: 16, border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 6 }}>
                    <div className="skeleton" style={{ height: 14, width: "70%" }} />
                    <div className="skeleton" style={{ height: 11, width: "50%" }} />
                  </div>
                </div>
                {[1,2,3].map(j => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div className="skeleton" style={{ height: 12, width: "40%" }} />
                    <div className="skeleton" style={{ height: 12, width: "30%" }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && groups.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#17172B", borderRadius: 14, border: "0.5px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>👥</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No groups yet</h2>
            <p style={{ fontSize: 13, color: "#A1A1AA", marginBottom: 24 }}>Create your first group to start splitting expenses.</p>
            <button onClick={() => setShowCreate(true)} style={{ background: "#FF4F79", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              Create first group
            </button>
          </div>
        )}

        {/* Groups grid — cards are clickable */}
        {!loading && groups.length > 0 && (
          <div className="groups-grid">
            {groups.map((g) => {
              const isPositive = g.netBalance >= 0;
              const balColor   = isPositive ? "#4ADE80" : "#FF6B6B";
              const balStr     = `${isPositive ? "+" : ""}₹${Math.abs(g.netBalance).toLocaleString("en-IN")}`;
              return (
                <div
                  key={g.id}
                  className="group-card"
                  onClick={() => router.push(`/groups/${g.id}`)}
                  style={{ background: "#17172B", borderRadius: 14, padding: 16, border: "0.5px solid rgba(255,255,255,0.07)", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, fontSize: 18, flexShrink: 0, background: isPositive ? "rgba(74,222,128,0.1)" : "rgba(255,107,107,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {g.emoji}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: "#A1A1AA" }}>{g.members} members{g.description ? ` · ${g.description}` : ""}</div>
                    </div>
                    {/* Arrow indicator */}
                    <div style={{ marginLeft: "auto" }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#444466" strokeWidth={2} aria-hidden="true">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", marginBottom: 12 }} />
                  {[
                    { label: "Total spent", val: `₹${g.totalSpent.toLocaleString("en-IN")}`, c: "#fff" },
                    { label: "Your share",  val: `₹${g.yourShare.toLocaleString("en-IN")}`,  c: "#fff" },
                    { label: "Net balance", val: balStr, c: balColor },
                  ].map(({ label, val, c }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#A1A1AA", marginBottom: 6 }}>
                      <span>{label}</span>
                      <span style={{ color: c, fontWeight: label === "Net balance" ? 600 : 400 }}>{val}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); setTick(t => t + 1); }}
        />
      )}
    </>
  );
}

function CreateGroupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name,    setName]    = useState("");
  const [emoji,   setEmoji]   = useState("👥");
  const [desc,    setDesc]    = useState("");
  const [emails,  setEmails]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Group name is required."); return; }
    setLoading(true); setError("");
    try {
      const memberEmails = emails.split(",").map(e => e.trim()).filter(Boolean);
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji, description: desc, memberEmails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create group.");
      onSuccess();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inp = { width: "100%", padding: "11px 14px", background: "#12121F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block" as const, fontSize: 12, fontWeight: 500 as const, color: "#A1A1AA", marginBottom: 6 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#17172B", borderRadius: 18, border: "0.5px solid rgba(255,255,255,0.1)", padding: 24, width: "100%", maxWidth: 440, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Create group</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer", fontSize: 20, padding: 4 }}>✕</button>
        </div>
        {error && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FF6B6B", marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Icon</label>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)} style={{ width: 36, height: 36, borderRadius: 8, fontSize: 18, border: emoji === e ? "1.5px solid #FF4F79" : "1px solid rgba(255,255,255,0.08)", background: emoji === e ? "rgba(255,79,121,0.1)" : "#12121F", cursor: "pointer" }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Group name</label>
            <input type="text" style={inp} placeholder="e.g. Flat 4B" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Description (optional)</label>
            <input type="text" style={inp} placeholder="e.g. Rent & utilities" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Invite members by email (comma separated)</label>
            <input type="text" style={inp} placeholder="rohan@example.com, priya@example.com" value={emails} onChange={e => setEmails(e.target.value)} />
            <p style={{ fontSize: 11, color: "#52526E", marginTop: 5 }}>Only existing Simplify users will be added.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "12px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#A1A1AA", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, background: "#FF4F79", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating..." : "Create group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}