"use client";
// app/(app)/groups/[id]/page.tsx

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["Food","Travel","Utilities","Groceries","Shopping","Entertainment","Health","General"];
const AVATAR_COLORS = ["rgba(255,79,121,0.2)","rgba(74,222,128,0.15)","rgba(239,159,39,0.2)","rgba(175,169,236,0.25)","rgba(83,74,183,0.25)","rgba(56,189,248,0.2)"];
const CATEGORY_EMOJI: Record<string,string> = { Food:"🍕", Travel:"✈️", Utilities:"💡", Groceries:"🛒", Shopping:"🛍️", Entertainment:"🎬", Health:"💊", General:"📋" };

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface Member  { id: string; fullName: string; email: string; upiId?: string; role: string; balance: number; }
interface Expense { id: string; title: string; amount: number; category: string; splitType: string; date: string; paidBy: { id: string; fullName: string }; myShare: number; participants: { userId: string; name: string; owed: number; paid: number }[]; }
interface Group   { id: string; name: string; emoji: string; description: string | null; currency: string; createdById: string; totalSpent: number; myShare: number; myBalance: number; members: Member[]; expenses: Expense[]; }

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const [group,   setGroup]   = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState<"expenses"|"members"|"balances">("expenses");
  const [showAdd, setShowAdd] = useState(false);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/groups/${id}`)
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          if (d.group) setGroup(d.group);
          else setError(d.message || "Failed to load.");
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) { setError("Failed to load group."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id, tick]);

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/groups");
  };

  if (loading) return <GroupSkeleton />;
  if (error)   return <ErrorState message={error} />;
  if (!group)  return null;

  const isPositive = group.myBalance >= 0;

  // ── Who owes whom (simplified debts) ──
  const debtors  = group.members.filter(m => m.balance < -0.01);
  const creditors = group.members.filter(m => m.balance > 0.01);

  return (
    <>
      <style>{`
        .skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.05) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .exp-row:hover{background:rgba(255,255,255,0.02)}
        .mem-row:hover{background:rgba(255,255,255,0.02)}
        .tab-btn:hover{background:rgba(255,255,255,0.04)}
        .back-link:hover{color:#fff !important}
      `}</style>

      <div style={{ maxWidth: 800, fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Back + header ── */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/groups" className="back-link" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#A1A1AA", textDecoration: "none", marginBottom: 16, transition: "color 0.15s" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            Back to groups
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: isPositive ? "rgba(74,222,128,0.12)" : "rgba(255,107,107,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                {group.emoji}
              </div>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{group.name}</h1>
                <p style={{ fontSize: 13, color: "#A1A1AA", margin: 0 }}>
                  {group.members.length} members{group.description ? ` · ${group.description}` : ""}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#FF4F79", border: "none", borderRadius: 10, padding: "9px 16px", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(255,79,121,0.3)" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add expense
              </button>
              <button onClick={handleLeave} style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "9px 14px", color: "#A1A1AA", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                Leave
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total spent",  value: `₹${group.totalSpent.toLocaleString("en-IN")}`, color: "#fff" },
            { label: "Your share",   value: `₹${group.myShare.toLocaleString("en-IN")}`,   color: "#fff" },
            { label: "Your balance", value: `${isPositive ? "+" : ""}₹${Math.abs(group.myBalance).toLocaleString("en-IN")}`, color: isPositive ? "#4ADE80" : "#FF6B6B" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#17172B", borderRadius: 12, padding: "14px 16px", border: "0.5px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 11, color: "#A1A1AA", textTransform: "uppercase" as const, letterSpacing: "0.8px", marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── Who owes whom summary ── */}
        {(debtors.length > 0 || creditors.length > 0) && (
          <div style={{ background: "rgba(255,79,121,0.06)", border: "0.5px solid rgba(255,79,121,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#FF4F79", textTransform: "uppercase" as const, letterSpacing: "0.8px", marginBottom: 10 }}>
              💡 Who owes whom
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {debtors.map(debtor => (
                creditors.map(creditor => {
                  const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
                  if (amount < 0.01) return null;
                  return (
                    <div key={`${debtor.id}-${creditor.id}`} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                      <span style={{ fontWeight: 500, color: "#FF6B6B" }}>{debtor.fullName}</span>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#A1A1AA" strokeWidth={2} aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      <span style={{ fontWeight: 500, color: "#4ADE80" }}>{creditor.fullName}</span>
                      <span style={{ marginLeft: "auto", fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff" }}>₹{amount.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {(["expenses","members","balances"] as const).map((t) => (
            <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
              fontSize: 12, fontWeight: 500, padding: "6px 16px", borderRadius: 20, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              border: tab === t ? "0.5px solid rgba(255,79,121,0.4)" : "0.5px solid rgba(255,255,255,0.1)",
              background: tab === t ? "rgba(255,79,121,0.15)" : "transparent",
              color: tab === t ? "#FF4F79" : "#A1A1AA",
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t !== "balances" && (
                <span style={{ marginLeft: 6, background: tab === t ? "#FF4F79" : "rgba(255,255,255,0.1)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10 }}>
                  {t === "expenses" ? group.expenses.length : group.members.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Expenses tab ── */}
        {tab === "expenses" && (
          <div style={{ background: "#17172B", borderRadius: 14, border: "0.5px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
            {group.expenses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>No expenses yet</div>
                <div style={{ fontSize: 13, color: "#A1A1AA", marginBottom: 20 }}>Add the first expense to this group.</div>
                <button onClick={() => setShowAdd(true)} style={{ background: "#FF4F79", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                  Add expense
                </button>
              </div>
            ) : (
              group.expenses.map((exp, i) => {
                const isLast = i === group.expenses.length - 1;
                return (
                  <div key={exp.id} className="exp-row" style={{ padding: "14px 18px", borderBottom: isLast ? "none" : "0.5px solid rgba(255,255,255,0.05)", transition: "background 0.1s", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,79,121,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                        {CATEGORY_EMOJI[exp.category] ?? "📋"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{exp.title}</div>
                        <div style={{ fontSize: 11.5, color: "#A1A1AA" }}>
                          {exp.paidBy.fullName} paid · {exp.splitType} split · {timeAgo(exp.date)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" as const }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "#fff" }}>₹{exp.amount.toLocaleString("en-IN")}</div>
                        <div style={{ fontSize: 11, color: exp.myShare > 0 ? "#FF6B6B" : "#A1A1AA", marginTop: 2 }}>
                          your share: ₹{exp.myShare.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                    {/* Participant breakdown */}
                    <div style={{ marginLeft: 50, display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                      {exp.participants.map(p => (
                        <span key={p.userId} style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "3px 10px", color: "#A1A1AA" }}>
                          {p.name}: ₹{p.owed.toLocaleString("en-IN")}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Members tab ── */}
        {tab === "members" && (
          <div style={{ background: "#17172B", borderRadius: 14, border: "0.5px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
            {group.members.map((m, i) => {
              const pos      = m.balance >= 0;
              const balColor = m.balance === 0 ? "#A1A1AA" : pos ? "#4ADE80" : "#FF6B6B";
              const balText  = m.balance === 0 ? "settled up" : pos ? `gets back ₹${m.balance.toLocaleString("en-IN")}` : `owes ₹${Math.abs(m.balance).toLocaleString("en-IN")}`;
              const isLast   = i === group.members.length - 1;
              const initials = m.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
              return (
                <div key={m.id} className="mem-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: isLast ? "none" : "0.5px solid rgba(255,255,255,0.05)", transition: "background 0.1s" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{m.fullName}</span>
                      {m.role === "admin" && <span style={{ fontSize: 10, fontWeight: 600, background: "rgba(255,79,121,0.12)", color: "#FF4F79", padding: "2px 7px", borderRadius: 10 }}>Admin</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#52526E", marginTop: 2 }}>{m.email}</div>
                    {m.upiId && <div style={{ fontSize: 11, color: "#4ADE80", marginTop: 2 }}>📱 {m.upiId}</div>}
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: balColor }}>{balText}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Balances tab ── */}
        {tab === "balances" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {group.members.filter(m => m.balance !== 0).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#17172B", borderRadius: 14, border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>All settled up!</div>
                <div style={{ fontSize: 13, color: "#A1A1AA" }}>No outstanding balances in this group.</div>
              </div>
            ) : (
              group.members.map((m, i) => {
                if (m.balance === 0) return null;
                const pos      = m.balance >= 0;
                const initials = m.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
                return (
                  <div key={m.id} style={{ background: "#17172B", borderRadius: 14, border: `0.5px solid ${pos ? "rgba(74,222,128,0.2)" : "rgba(255,107,107,0.2)"}`, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{m.fullName}</div>
                        <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 2 }}>
                          {pos ? "is owed money" : "owes money"}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: pos ? "#4ADE80" : "#FF6B6B" }}>
                        {pos ? "+" : ""}₹{Math.abs(m.balance).toLocaleString("en-IN")}
                      </div>
                    </div>
                    {m.upiId && !pos && (
                      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#A1A1AA" }}>UPI: <strong style={{ color: "#fff" }}>{m.upiId}</strong></span>
                        <button style={{ fontSize: 12, fontWeight: 600, color: "#FF4F79", border: "0.5px solid rgba(255,79,121,0.4)", padding: "5px 14px", borderRadius: 20, background: "rgba(255,79,121,0.08)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                          Settle up
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Add Expense Modal ── */}
      {showAdd && (
        <AddExpenseModal
          groupId={group.id}
          groupName={group.name}
          members={group.members}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); setTick(t => t + 1); }}
        />
      )}
    </>
  );
}

/* ── Add Expense Modal with member split selector ── */
function AddExpenseModal({
  groupId, groupName, members, onClose, onSuccess
}: {
  groupId: string; groupName: string;
  members: Member[];
  onClose: () => void; onSuccess: () => void;
}) {
  const [title,      setTitle]      = useState("");
  const [amount,     setAmount]     = useState("");
  const [category,   setCategory]   = useState("General");
  const [splitType,  setSplitType]  = useState("equal");
  const [notes,      setNotes]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(members.map(m => m.id));
  const [exactAmounts, setExactAmounts] = useState<Record<string,string>>({});
  const [percentages,  setPercentages]  = useState<Record<string,string>>({});

  const toggleMember = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const totalExact = Object.values(exactAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const totalPct   = Object.values(percentages).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount."); return; }
    if (selectedIds.length === 0) { setError("Select at least one member to split with."); return; }

    if (splitType === "exact") {
      const diff = Math.abs(totalExact - amt);
      if (diff > 0.01) { setError(`Exact amounts must add up to ₹${amt}. Currently: ₹${totalExact.toFixed(2)}`); return; }
    }
    if (splitType === "percentage") {
      const diff = Math.abs(totalPct - 100);
      if (diff > 0.01) { setError(`Percentages must add up to 100%. Currently: ${totalPct.toFixed(1)}%`); return; }
    }

    // Build splits payload
    const splits: Record<string,number> = {};
    if (splitType === "exact") {
      selectedIds.forEach(id => { splits[id] = parseFloat(exactAmounts[id] || "0"); });
    } else if (splitType === "percentage") {
      selectedIds.forEach(id => { splits[id] = parseFloat(percentages[id] || "0"); });
    }

    setLoading(true); setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, amount: amt, groupId, category, splitType, notes,
          selectedMemberIds: selectedIds,
          splits: Object.keys(splits).length > 0 ? splits : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add expense.");
      onSuccess();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const amt = parseFloat(amount) || 0;
  const equalShare = selectedIds.length > 0 ? (amt / selectedIds.length) : 0;

  const inp = { width: "100%", padding: "10px 14px", background: "#12121F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block" as const, fontSize: 12, fontWeight: 500 as const, color: "#A1A1AA", marginBottom: 6 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#17172B", borderRadius: 18, border: "0.5px solid rgba(255,255,255,0.1)", padding: 24, width: "100%", maxWidth: 500, fontFamily: "'DM Sans', sans-serif", margin: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>Add expense</h2>
            <p style={{ fontSize: 12, color: "#A1A1AA", margin: 0 }}>to {groupName}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer", fontSize: 20, padding: 4 }}>✕</button>
        </div>

        {error && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FF6B6B", marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>What was it for?</label>
            <input type="text" style={inp} placeholder="e.g. Pizza Night" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Amount (₹)</label>
            <input type="number" style={{ ...inp, fontSize: 18, fontWeight: 600, fontFamily: "'Syne', sans-serif" }} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" />
          </div>

          {/* Category */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
            </select>
          </div>

          {/* Split type */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Split type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { key: "equal",      label: "Equal" },
                { key: "exact",      label: "Exact ₹" },
                { key: "percentage", label: "Percent %" },
              ].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setSplitType(key)} style={{
                  flex: 1, padding: "9px 4px", borderRadius: 10, cursor: "pointer",
                  fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                  border: splitType === key ? "1px solid rgba(255,79,121,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  background: splitType === key ? "rgba(255,79,121,0.12)" : "#12121F",
                  color: splitType === key ? "#FF4F79" : "#A1A1AA",
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Member split selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>
              Split with
              <span style={{ marginLeft: 8, fontSize: 11, color: "#52526E" }}>({selectedIds.length} of {members.length} selected)</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {members.map(m => {
                const selected = selectedIds.includes(m.id);
                const initials = m.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: selected ? "rgba(255,79,121,0.06)" : "#12121F", border: `1px solid ${selected ? "rgba(255,79,121,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, cursor: "pointer" }}
                    onClick={() => toggleMember(m.id)}>
                    {/* Checkbox */}
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${selected ? "#FF4F79" : "rgba(255,255,255,0.2)"}`, background: selected ? "#FF4F79" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selected && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3} aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    {/* Avatar */}
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,79,121,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#FF4F79", flexShrink: 0 }}>
                      {initials}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, color: selected ? "#fff" : "#A1A1AA", fontWeight: selected ? 500 : 400 }}>{m.fullName}</span>

                    {/* Amount display per split type */}
                    {selected && splitType === "equal" && amt > 0 && (
                      <span style={{ fontSize: 12, color: "#4ADE80", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
                        ₹{equalShare.toFixed(2)}
                      </span>
                    )}

                    {selected && splitType === "exact" && (
                      <input
                        type="number" placeholder="0.00" min="0" step="0.01"
                        value={exactAmounts[m.id] ?? ""}
                        onChange={e => { e.stopPropagation(); setExactAmounts(prev => ({ ...prev, [m.id]: e.target.value })); }}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 80, padding: "4px 8px", background: "#0B0B1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", textAlign: "right" as const }}
                      />
                    )}

                    {selected && splitType === "percentage" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input
                          type="number" placeholder="0" min="0" max="100" step="1"
                          value={percentages[m.id] ?? ""}
                          onChange={e => { e.stopPropagation(); setPercentages(prev => ({ ...prev, [m.id]: e.target.value })); }}
                          onClick={e => e.stopPropagation()}
                          style={{ width: 60, padding: "4px 8px", background: "#0B0B1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", textAlign: "right" as const }}
                        />
                        <span style={{ fontSize: 12, color: "#A1A1AA" }}>%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals validation */}
            {splitType === "exact" && amt > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: Math.abs(totalExact - amt) < 0.01 ? "#4ADE80" : "#FF6B6B" }}>
                Total: ₹{totalExact.toFixed(2)} / ₹{amt.toFixed(2)}
                {Math.abs(totalExact - amt) < 0.01 ? " ✓" : ` (₹${(amt - totalExact).toFixed(2)} remaining)`}
              </div>
            )}
            {splitType === "percentage" && (
              <div style={{ marginTop: 8, fontSize: 12, color: Math.abs(totalPct - 100) < 0.01 ? "#4ADE80" : "#FF6B6B" }}>
                Total: {totalPct.toFixed(1)}% / 100%
                {Math.abs(totalPct - 100) < 0.01 ? " ✓" : ` (${(100 - totalPct).toFixed(1)}% remaining)`}
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Notes (optional)</label>
            <input type="text" style={inp} placeholder="Add a note..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "12px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#A1A1AA", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, background: "#FF4F79", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Adding..." : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Skeleton & Error ── */
function GroupSkeleton() {
  return (
    <div style={{ maxWidth: 800, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`.skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.05) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="skeleton" style={{ height: 16, width: 120, marginBottom: 24 }} />
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14 }} />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          <div className="skeleton" style={{ height: 22, width: 200 }} />
          <div className="skeleton" style={{ height: 13, width: 120 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <div style={{ color: "#FF6B6B", fontSize: 14, marginBottom: 16 }}>{message}</div>
      <Link href="/groups" style={{ background: "#FF4F79", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Back to groups</Link>
    </div>
  );
}