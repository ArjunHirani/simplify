"use client";
// app/(app)/dashboard/page.tsx

import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import type { Group, Friend, Activity } from "@/types";

type Tab = "groups" | "friends";

export default function DashboardPage() {
  const { summary, groups, friends, activity, loading, error, refetch } = useDashboard();
  const [tab, setTab] = useState<Tab>("groups");
  const [showAddExpense, setShowAddExpense] = useState(false);

  if (error) {
    return (
      <div style={{
        background: "#17172B", borderRadius: 14, padding: "32px",
        textAlign: "center", border: "0.5px solid rgba(255,107,107,0.2)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ color: "#FF6B6B", fontSize: 14, marginBottom: 16 }}>{error}</div>
        <button onClick={refetch} style={{
          background: "#FF4F79", border: "none", borderRadius: 10,
          padding: "10px 20px", color: "#fff", fontSize: 13,
          fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .dash-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .dash-group-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        @media (max-width: 700px) {
          .dash-cards { grid-template-columns: 1fr; }
          .dash-group-grid { grid-template-columns: 1fr; }
        }
        .group-card:hover { border-color: rgba(255,79,121,0.3) !important; }
        .activity-row:hover { background: rgba(255,255,255,0.02); }
        .friend-row:hover { background: rgba(255,255,255,0.02); }
        .dash-fab:hover { background: #FF6B8F !important; transform: scale(1.04); }
        .tab-btn:hover { background: rgba(255,255,255,0.05); }
        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div style={{ maxWidth: 900, fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Summary cards ── */}
        <div className="dash-cards">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <SummaryCard
                label="You are owed"
                value={`₹${summary.totalOwed.toLocaleString("en-IN")}`}
                color="#4ADE80"
                sub={`from ${friends.filter(f => f.balance > 0).length} people`}
              />
              <SummaryCard
                label="You owe"
                value={`₹${summary.totalOwing.toLocaleString("en-IN")}`}
                color="#FF6B6B"
                sub={`to ${friends.filter(f => f.balance < 0).length} people`}
              />
              <SummaryCard
                label="This month"
                value={`₹${summary.monthlyShared.toLocaleString("en-IN")}`}
                color="#fff"
                sub="total shared"
              />
            </>
          )}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {(["groups", "friends"] as Tab[]).map((t) => (
            <button
              key={t}
              className="tab-btn"
              onClick={() => setTab(t)}
              style={{
                fontSize: 12, fontWeight: 500,
                padding: "6px 16px", borderRadius: 20, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                border: tab === t ? "0.5px solid rgba(255,79,121,0.4)" : "0.5px solid rgba(255,255,255,0.1)",
                background: tab === t ? "rgba(255,79,121,0.15)" : "transparent",
                color: tab === t ? "#FF4F79" : "#A1A1AA",
                transition: "all 0.15s",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "groups" && !loading && groups.length > 0 && (
                <span style={{
                  marginLeft: 6, background: "#FF4F79", color: "#fff",
                  fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10,
                }}>
                  {groups.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Groups tab ── */}
        {tab === "groups" && (
          <>
            {loading ? (
              <div className="dash-group-grid">
                <SkeletonGroupCard />
                <SkeletonGroupCard />
              </div>
            ) : groups.length === 0 ? (
              <EmptyState
                emoji="👥"
                title="No groups yet"
                subtitle="Create a group to start splitting expenses with friends."
              />
            ) : (
              <div className="dash-group-grid">
                {groups.map((g) => <GroupCard key={g.id} group={g} />)}
              </div>
            )}

            {/* Activity feed */}
            <div style={{
              background: "#17172B", borderRadius: 14,
              border: "0.5px solid rgba(255,255,255,0.07)",
              overflow: "hidden", marginBottom: 20,
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "0.5px solid rgba(255,255,255,0.07)",
              }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>
                  Recent activity
                </span>
                <button style={{ fontSize: 12, color: "#FF4F79", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  See all →
                </button>
              </div>

              {loading ? (
                <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div className="skeleton" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div className="skeleton" style={{ height: 13, width: "60%" }} />
                        <div className="skeleton" style={{ height: 11, width: "40%" }} />
                      </div>
                      <div className="skeleton" style={{ height: 13, width: 60 }} />
                    </div>
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#A1A1AA", fontSize: 13 }}>
                  No activity yet. Add an expense to get started.
                </div>
              ) : (
                activity.slice(0, 8).map((a) => <ActivityRow key={a.id} item={a} />)
              )}
            </div>
          </>
        )}

        {/* ── Friends tab ── */}
        {tab === "friends" && (
          <div style={{
            background: "#17172B", borderRadius: 14,
            border: "0.5px solid rgba(255,255,255,0.07)",
            overflow: "hidden", marginBottom: 20,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "0.5px solid rgba(255,255,255,0.07)",
            }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>
                Friend balances
              </span>
              <button style={{ fontSize: 12, color: "#FF4F79", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                + Add friend
              </button>
            </div>

            {loading ? (
              <div style={{ padding: "8px 0" }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 18px" }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                    <div className="skeleton" style={{ height: 13, flex: 1 }} />
                    <div className="skeleton" style={{ height: 13, width: 80 }} />
                    <div className="skeleton" style={{ height: 28, width: 60, borderRadius: 20 }} />
                  </div>
                ))}
              </div>
            ) : friends.length === 0 ? (
              <EmptyState
                emoji="🤝"
                title="No friends yet"
                subtitle="Add friends to split expenses and track balances."
              />
            ) : (
              friends.map((f) => <FriendRow key={f.id} friend={f} />)
            )}
          </div>
        )}
      </div>

      {/* ── Add Expense FAB ── */}
      <button
        className="dash-fab"
        aria-label="Add expense"
        onClick={() => setShowAddExpense(true)}
        style={{
          position: "fixed", bottom: 28, right: 28,
          background: "#FF4F79", border: "none", borderRadius: 50,
          padding: "13px 22px",
          fontSize: 13, fontWeight: 600, color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(255,79,121,0.4)",
          transition: "all 0.15s",
          zIndex: 40,
        }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add expense
      </button>

      {/* ── Add Expense Modal ── */}
      {showAddExpense && (
        <AddExpenseModal
          groups={groups}
          onClose={() => setShowAddExpense(false)}
          onSuccess={() => { setShowAddExpense(false); refetch(); }}
        />
      )}
    </>
  );
}

/* ──────────────── Sub-components ──────────────── */

function SummaryCard({ label, value, color, sub }: { label: string; value: string; color: string; sub: string }) {
  return (
    <div style={{
      background: "#17172B", borderRadius: 14,
      padding: "16px 18px",
      border: "0.5px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#A1A1AA" }}>{sub}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#17172B", borderRadius: 14, padding: "16px 18px", border: "0.5px solid rgba(255,255,255,0.07)" }}>
      <div className="skeleton" style={{ height: 11, width: "60%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 24, width: "80%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 11, width: "40%" }} />
    </div>
  );
}

function SkeletonGroupCard() {
  return (
    <div style={{ background: "#17172B", borderRadius: 14, padding: "16px", border: "0.5px solid rgba(255,255,255,0.07)" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="skeleton" style={{ height: 14, width: "70%" }} />
          <div className="skeleton" style={{ height: 11, width: "50%" }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 0.5, marginBottom: 12 }} />
      {[1,2,3].map(i => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div className="skeleton" style={{ height: 12, width: "40%" }} />
          <div className="skeleton" style={{ height: 12, width: "30%" }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div style={{
      textAlign: "center", padding: "32px 20px",
      color: "#A1A1AA", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{subtitle}</div>
    </div>
  );
}

function GroupCard({ group }: { group: Group }) {
  const isPositive = group.netBalance >= 0;
  const balColor   = isPositive ? "#4ADE80" : "#FF6B6B";
  const balStr     = `${isPositive ? "+" : ""}₹${Math.abs(group.netBalance).toLocaleString("en-IN")}`;

  return (
    <div className="group-card" style={{
      background: "#17172B", borderRadius: 14,
      padding: "16px", border: "0.5px solid rgba(255,255,255,0.07)",
      cursor: "pointer", transition: "border-color 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: isPositive ? "rgba(74,222,128,0.1)" : "rgba(255,107,107,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>
          {group.emoji}
        </div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
            {group.name}
          </div>
          <div style={{ fontSize: 11, color: "#A1A1AA" }}>
            {group.members} members{group.description ? ` · ${group.description}` : ""}
          </div>
        </div>
      </div>
      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", marginBottom: 12 }} />
      {[
        { label: "Total spent", val: `₹${group.totalSpent.toLocaleString("en-IN")}`,  c: "#fff" },
        { label: "Your share",  val: `₹${group.yourShare.toLocaleString("en-IN")}`,   c: "#fff" },
        { label: "Net balance", val: balStr, c: balColor },
      ].map(({ label, val, c }) => (
        <div key={label} style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 12, color: "#A1A1AA", marginBottom: 6,
        }}>
          <span>{label}</span>
          <span style={{ color: c, fontWeight: label === "Net balance" ? 600 : 400 }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityRow({ item }: { item: Activity }) {
  const isPositive = item.amount >= 0;
  const amtColor   = isPositive ? "#4ADE80" : "#FF6B6B";
  const amtStr     = `${isPositive ? "+" : ""}₹${Math.abs(item.amount).toLocaleString("en-IN")}`;

  return (
    <div className="activity-row" style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 18px",
      borderBottom: "0.5px solid rgba(255,255,255,0.04)",
      cursor: "pointer", transition: "background 0.1s",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: item.emojiColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>
        {item.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{item.title}</div>
        <div style={{ fontSize: 11.5, color: "#A1A1AA" }}>{item.description}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: amtColor }}>
          {amtStr}
        </div>
        <div style={{ fontSize: 10, color: "#444466", marginTop: 2 }}>{item.timestamp}</div>
      </div>
    </div>
  );
}

function FriendRow({ friend }: { friend: Friend }) {
  const settled  = friend.balance === 0;
  const owesYou  = friend.balance > 0;
  const balColor = settled ? "#A1A1AA" : owesYou ? "#4ADE80" : "#FF6B6B";
  const balText  = settled
    ? "settled up"
    : owesYou
    ? `owes ₹${friend.balance.toLocaleString("en-IN")}`
    : `you owe ₹${Math.abs(friend.balance).toLocaleString("en-IN")}`;

  return (
    <div className="friend-row" style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 18px",
      borderBottom: "0.5px solid rgba(255,255,255,0.05)",
      cursor: "pointer", transition: "background 0.1s",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: friend.avatarColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0,
      }}>
        {friend.initials}
      </div>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#fff" }}>{friend.name}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: balColor, marginRight: 12 }}>
        {balText}
      </div>
      <button style={{
        fontSize: 11, fontWeight: 500,
        color: settled ? "#52526E" : "#FF4F79",
        border: `0.5px solid ${settled ? "rgba(255,255,255,0.1)" : "rgba(255,79,121,0.4)"}`,
        padding: "5px 12px", borderRadius: 20,
        background: settled ? "transparent" : "rgba(255,79,121,0.08)",
        cursor: settled ? "default" : "pointer",
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: "nowrap",
      }}>
        {settled ? "Done" : owesYou ? "Remind" : "Settle"}
      </button>
    </div>
  );
}

/* ──────────────── Add Expense Modal ──────────────── */

const CATEGORIES = ["Food", "Travel", "Utilities", "Groceries", "Shopping", "Entertainment", "Health", "General"];

function AddExpenseModal({
  groups,
  onClose,
  onSuccess,
}: {
  groups: Group[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title,     setTitle]     = useState("");
  const [amount,    setAmount]    = useState("");
  const [groupId,   setGroupId]   = useState(groups[0]?.id ?? "");
  const [category,  setCategory]  = useState("General");
  const [splitType, setSplitType] = useState("equal");
  const [notes,     setNotes]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Enter a valid amount."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount: parseFloat(amount), groupId: groupId || null, category, splitType, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add expense.");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "#12121F", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, color: "#fff", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 500,
    color: "#A1A1AA", marginBottom: 6,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#17172B", borderRadius: 18,
          border: "0.5px solid rgba(255,255,255,0.1)",
          padding: "24px", width: "100%", maxWidth: 460,
          fontFamily: "'DM Sans', sans-serif",
          animation: "slideUp 0.2s ease",
        }}
      >
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>
            Add expense
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer", fontSize: 20, padding: 4 }}>
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)",
            borderRadius: 10, padding: "10px 14px",
            fontSize: 13, color: "#FF6B6B", marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>What was it for?</label>
            <input
              type="text" style={inputStyle} placeholder="e.g. Pizza Night"
              value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
            />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Amount (₹)</label>
            <input
              type="number" style={inputStyle} placeholder="0.00"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              min="0" step="0.01"
            />
          </div>

          {/* Group + Category row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Group</label>
              <select
                value={groupId} onChange={(e) => setGroupId(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">No group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={category} onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Split type */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Split type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["equal", "exact", "percentage"].map((type) => (
                <button
                  key={type} type="button"
                  onClick={() => setSplitType(type)}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 8,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    border: splitType === type ? "1px solid rgba(255,79,121,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    background: splitType === type ? "rgba(255,79,121,0.12)" : "#12121F",
                    color: splitType === type ? "#FF4F79" : "#A1A1AA",
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Notes (optional)</label>
            <input
              type="text" style={inputStyle} placeholder="Add a note..."
              value={notes} onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button" onClick={onClose}
              style={{
                padding: "12px 18px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                color: "#A1A1AA", fontSize: 14, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                flex: 1, padding: "12px",
                background: "#FF4F79", border: "none", borderRadius: 12,
                color: "#fff", fontSize: 14, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Adding..." : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}