"use client";
// app/(app)/friends/page.tsx

import { useState, useEffect } from "react";
import SettleUpModal from "@/components/settlements/SettleUpModal";

interface Friend {
  id: string;
  name: string;
  email: string;
  initials: string;
  balance: number;
  friendshipId: string;
  upiId?: string;
}

interface PendingRequest {
  id: string;
  sender: { id: string; fullName: string; email: string };
}

const AVATAR_COLORS = [
  "rgba(255,79,121,0.15)", "rgba(74,222,128,0.12)",
  "rgba(239,159,39,0.15)", "rgba(175,169,236,0.2)",
  "rgba(83,74,183,0.2)",   "rgba(56,189,248,0.15)",
];

export default function FriendsPage() {
  const [friends,  setFriends]  = useState<Friend[]>([]);
  const [pending,  setPending]  = useState<PendingRequest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showAdd,  setShowAdd]  = useState(false);
  const [settling, setSettling] = useState<Friend | null>(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/friends")
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          setFriends(d.friends ?? []);
          setPending(d.pendingRequests ?? []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) { setError("Failed to load friends."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [tick]);

  const handleAccept = async (friendshipId: string) => {
    await fetch("/api/friends", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ friendshipId, action: "accept" }) });
    setTick(t => t + 1);
  };

  const handleReject = async (friendshipId: string) => {
    await fetch("/api/friends", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ friendshipId, action: "reject" }) });
    setTick(t => t + 1);
  };

  const totalOwed  = friends.filter(f => f.balance > 0).reduce((s, f) => s + f.balance, 0);
  const totalOwing = friends.filter(f => f.balance < 0).reduce((s, f) => s + Math.abs(f.balance), 0);

  return (
    <>
      <style>{`
        .skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.05) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .friend-row:hover{background:rgba(255,255,255,0.02) !important}
        .pending-row:hover{background:rgba(255,255,255,0.02) !important}
      `}</style>

      <div style={{ maxWidth: 700, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Friends</h1>
            <p style={{ fontSize: 13, color: "#A1A1AA", margin: 0 }}>{loading ? "Loading..." : `${friends.length} friend${friends.length !== 1 ? "s" : ""}`}</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#FF4F79", border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(255,79,121,0.3)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add friend
          </button>
        </div>

        {/* Summary */}
        {!loading && friends.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ background: "#17172B", borderRadius: 14, padding: "14px 16px", border: "0.5px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>You are owed</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#4ADE80" }}>₹{totalOwed.toLocaleString("en-IN")}</div>
            </div>
            <div style={{ background: "#17172B", borderRadius: 14, padding: "14px 16px", border: "0.5px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 11, color: "#A1A1AA", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>You owe</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#FF6B6B" }}>₹{totalOwing.toLocaleString("en-IN")}</div>
            </div>
          </div>
        )}

        {/* Pending requests */}
        {pending.length > 0 && (
          <div style={{ background: "#17172B", borderRadius: 14, border: "0.5px solid rgba(239,159,39,0.3)", overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "12px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>Pending requests</span>
              <span style={{ background: "rgba(239,159,39,0.2)", color: "#EF9F27", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>{pending.length}</span>
            </div>
            {pending.map((req) => (
              <div key={req.id} className="pending-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.04)", transition: "background 0.1s" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(239,159,39,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#EF9F27", flexShrink: 0 }}>
                  {req.sender.fullName.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{req.sender.fullName}</div>
                  <div style={{ fontSize: 11, color: "#A1A1AA" }}>{req.sender.email}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleReject(req.id)} style={{ padding: "6px 12px", background: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#A1A1AA", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Decline</button>
                  <button onClick={() => handleAccept(req.id)} style={{ padding: "6px 14px", background: "#FF4F79", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Accept</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 12, padding: 16, color: "#FF6B6B", fontSize: 13, marginBottom: 20 }}>{error}</div>}

        {/* Friends list */}
        <div style={{ background: "#17172B", borderRadius: 14, border: "0.5px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>All friends</span>
          </div>

          {loading ? (
            <div style={{ padding: "8px 0" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 18px" }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="skeleton" style={{ height: 13, width: "50%" }} />
                    <div className="skeleton" style={{ height: 11, width: "35%" }} />
                  </div>
                  <div className="skeleton" style={{ height: 13, width: 80 }} />
                  <div className="skeleton" style={{ height: 28, width: 60, borderRadius: 20 }} />
                </div>
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>No friends yet</div>
              <div style={{ fontSize: 13, color: "#A1A1AA", marginBottom: 20 }}>Add friends to split expenses and track balances.</div>
              <button onClick={() => setShowAdd(true)} style={{ background: "#FF4F79", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Add your first friend</button>
            </div>
          ) : (
            friends.map((f, i) => {
              const settled  = f.balance === 0;
              const owesYou  = f.balance > 0;
              const balColor = settled ? "#A1A1AA" : owesYou ? "#4ADE80" : "#FF6B6B";
              const balText  = settled ? "settled up" : owesYou ? `owes ₹${f.balance.toLocaleString("en-IN")}` : `you owe ₹${Math.abs(f.balance).toLocaleString("en-IN")}`;
              const btnText  = settled ? "Done" : owesYou ? "Remind" : "Settle";
              return (
                <div key={f.id} className="friend-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: i < friends.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.1s" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                    {f.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: "#52526E" }}>{f.email}</div>
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: balColor, marginRight: 12 }}>{balText}</div>
                  <button
                    onClick={() => { if (!settled && !owesYou) setSettling(f); }}
                    style={{ fontSize: 11, fontWeight: 500, color: settled ? "#52526E" : owesYou ? "#A1A1AA" : "#FF4F79", border: `0.5px solid ${settled || owesYou ? "rgba(255,255,255,0.1)" : "rgba(255,79,121,0.4)"}`, padding: "5px 12px", borderRadius: 20, background: !settled && !owesYou ? "rgba(255,79,121,0.08)" : "transparent", cursor: !settled && !owesYou ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" as const }}>
                    {btnText}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showAdd && <AddFriendModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); setTick(t => t + 1); }} />}

      {settling && (
        <SettleUpModal
          receiverId={settling.id}
          receiverName={settling.name}
          receiverUpi={settling.upiId}
          amount={Math.abs(settling.balance)}
          onClose={() => setSettling(null)}
          onSuccess={() => { setSettling(null); setTick(t => t + 1); }}
        />
      )}
    </>
  );
}

function AddFriendModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/friends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send request.");
      setSuccess("Friend request sent!");
      setTimeout(onSuccess, 1200);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#17172B", borderRadius: 18, border: "0.5px solid rgba(255,255,255,0.1)", padding: 24, width: "100%", maxWidth: 400, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Add friend</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer", fontSize: 20, padding: 4 }}>✕</button>
        </div>
        {error   && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FF6B6B", marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4ADE80", marginBottom: 16 }}>{success}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#A1A1AA", marginBottom: 6 }}>Friend&apos;s email address</label>
            <input type="email" placeholder="rohan@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus
              style={{ width: "100%", padding: "11px 14px", background: "#12121F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" as const }} />
            <p style={{ fontSize: 11, color: "#52526E", marginTop: 6 }}>They must already have a Simplify account.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "12px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#A1A1AA", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, background: "#FF4F79", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Sending..." : "Send request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}