"use client";
// components/settlements/SettleUpModal.tsx

import { useState } from "react";

interface Props {
  receiverId:   string;
  receiverName: string;
  receiverUpi?: string | null;
  amount:       number; // pre-filled from balance
  groupId?:     string;
  onClose:      () => void;
  onSuccess:    () => void;
}

const METHODS = [
  { key: "upi",  label: "UPI",          emoji: "📱" },
  { key: "cash", label: "Cash",         emoji: "💵" },
  { key: "card", label: "Card",         emoji: "💳" },
  { key: "bank", label: "Bank Transfer",emoji: "🏦" },
];

export default function SettleUpModal({ receiverId, receiverName, receiverUpi, amount, groupId, onClose, onSuccess }: Props) {
  const [settleAmount, setSettleAmount] = useState(amount.toFixed(2));
  const [method,       setMethod]       = useState("upi");
  const [note,         setNote]         = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(settleAmount);
    if (!amt || amt <= 0) { setError("Enter a valid amount."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, amount: amt, method, note, groupId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record payment.");
      setSuccess(true);
      setTimeout(onSuccess, 1500);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inp = { width: "100%", padding: "11px 14px", background: "#12121F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block" as const, fontSize: 12, fontWeight: 500 as const, color: "#A1A1AA", marginBottom: 6 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#17172B", borderRadius: 18, border: "0.5px solid rgba(255,255,255,0.1)", padding: 24, width: "100%", maxWidth: 420, fontFamily: "'DM Sans', sans-serif" }}>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Payment recorded!</h2>
            <p style={{ fontSize: 13, color: "#A1A1AA" }}>₹{parseFloat(settleAmount).toLocaleString("en-IN")} sent to {receiverName}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>Settle up</h2>
                <p style={{ fontSize: 12, color: "#A1A1AA", margin: 0 }}>Paying {receiverName}</p>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer", fontSize: 20, padding: 4 }}>✕</button>
            </div>

            {/* UPI hint */}
            {receiverUpi && (
              <div style={{ background: "rgba(74,222,128,0.08)", border: "0.5px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#4ADE80", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span>📱</span>
                UPI: <strong>{receiverUpi}</strong>
              </div>
            )}

            {error && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FF6B6B", marginBottom: 16 }}>{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {/* Amount */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Amount (₹)</label>
                <input type="number" style={{ ...inp, fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
                  value={settleAmount} onChange={e => setSettleAmount(e.target.value)} min="0" step="0.01" />
              </div>

              {/* Payment method */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Payment method</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {METHODS.map(({ key, label, emoji }) => (
                    <button key={key} type="button" onClick={() => setMethod(key)} style={{
                      padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                      border: method === key ? "1px solid rgba(255,79,121,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      background: method === key ? "rgba(255,79,121,0.12)" : "#12121F",
                      color: method === key ? "#FF4F79" : "#A1A1AA",
                    }}>
                      <span>{emoji}</span>{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Note (optional)</label>
                <input type="text" style={inp} placeholder="e.g. For Goa trip" value={note} onChange={e => setNote(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={onClose} style={{ padding: "12px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#A1A1AA", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, background: "#FF4F79", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Recording..." : `Record ₹${parseFloat(settleAmount || "0").toLocaleString("en-IN")} payment`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}