// src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type State = "idle" | "loading" | "success" | "invalid";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [state, setState]               = useState<State>("idle");
  const [error, setError]               = useState("");

  // If no token in URL, mark as invalid immediately
  useEffect(() => {
    if (!token) setState("invalid");
  }, [token]);

  const strengthScore = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strengthScore];
  const strengthColor = ["", "#FF6B6B", "#EF9F27", "#4ADE80", "#4ADE80"][strengthScore];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }

    setState("loading");
    try {
      await resetPassword(token!, password);
      // resetPassword() in useAuth redirects to /login?reset=success
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed. The link may have expired.");
      setState("idle");
    }
  };

  /* ── Invalid / expired token ── */
  if (state === "invalid") {
    return (
      <div className="auth-page">
        <div className="auth-right" style={{ flex: 1 }}>
          <div className="auth-box" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>⛔</div>
            <h1 className="auth-title">Link invalid or expired</h1>
            <p className="auth-sub" style={{ marginBottom: 28 }}>
              This password reset link has expired or already been used.
              Reset links are valid for 15 minutes.
            </p>
            <Link href="/forgot-password" className="btn-primary" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
              Request a new link
            </Link>
            <p className="switch-text">
              <Link href="/login" className="link">Back to login</Link>
            </p>
          </div>
        </div>
        <SharedStyles />
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-left">
        <div>
          <span className="brand-logo">Simplify<span className="brand-dot">.</span></span>
          <p className="brand-tagline">Split bills. Not friendships.</p>
        </div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🔑</div>
          <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.7 }}>
            Choose a strong password — at least 8 characters, with a mix of letters, numbers, and symbols.
          </p>
        </div>
        <p className="left-footer">Your account is safe with us.</p>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-box">
          <Link href="/login" className="back-link">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to login
          </Link>

          <div className="auth-header">
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-sub">Must be at least 8 characters and different from your old one.</p>
          </div>

          {error && (
            <div className="banner banner--error">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="password" className="label">New password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input input--pad-r"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="new-password"
                  autoFocus
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {password.length > 0 && (
                <div className="strength-row">
                  <div className="strength-bars">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="strength-bar"
                        style={{ background: i <= strengthScore ? strengthColor : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="field">
              <label htmlFor="confirm" className="label">Confirm new password</label>
              <div className="input-wrap">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  className={`input input--pad-r ${confirm && confirm !== password ? "input--error" : ""}`}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                  autoComplete="new-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="field-error">Passwords don&apos;t match</p>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={state === "loading"}>
              {state === "loading"
                ? <span className="btn-loading"><span className="spinner" aria-hidden />Updating password...</span>
                : "Reset password"}
            </button>
          </form>
        </div>
      </div>

      <SharedStyles />
    </div>
  );
}

function SharedStyles() {
  return (
    <style jsx global>{`
      .auth-page{ min-height:100vh; display:flex; background:#0B0B1A; font-family:'DM Sans',sans-serif; }

      .auth-left{
        display:none; flex-direction:column; justify-content:space-between;
        padding:48px; background:#17172B;
        border-right:1px solid rgba(255,255,255,0.06);
        position:relative; overflow:hidden;
      }
      @media(min-width:1024px){ .auth-left{ display:flex; width:42%; } }
      .auth-left::before{
        content:''; position:absolute; inset:0;
        background-image:radial-gradient(rgba(255,79,121,0.07) 1px, transparent 1px);
        background-size:28px 28px; pointer-events:none;
      }

      .brand-logo{ font-family:'Syne',sans-serif; font-size:32px; font-weight:800; color:#fff; letter-spacing:-1px; }
      .brand-dot{ color:#FF4F79; }
      .brand-tagline{ margin-top:8px; font-size:15px; color:#A1A1AA; }
      .left-footer{ font-size:12px; color:#52526E; position:relative; z-index:1; }

      .auth-right{ flex:1; display:flex; align-items:center; justify-content:center; padding:32px 24px; }
      .auth-box{ width:100%; max-width:420px; animation:fadeIn 0.4s ease; }
      @keyframes fadeIn{ from{ opacity:0; transform:translateY(16px); } to{ opacity:1; transform:translateY(0); } }

      .back-link{ display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#A1A1AA; text-decoration:none; margin-bottom:28px; transition:color 0.15s; }
      .back-link:hover{ color:#fff; }

      .auth-header{ margin-bottom:28px; }
      .auth-title{ font-family:'Syne',sans-serif; font-size:28px; font-weight:700; color:#fff; letter-spacing:-0.5px; margin-bottom:8px; }
      .auth-sub{ font-size:14px; color:#A1A1AA; line-height:1.6; }

      .banner{ display:flex; align-items:center; gap:8px; border-radius:10px; padding:10px 14px; font-size:13px; margin-bottom:20px; border:1px solid; }
      .banner--error{ background:rgba(255,107,107,0.1); border-color:rgba(255,107,107,0.25); color:#FF6B6B; }

      .field{ margin-bottom:18px; }
      .label{ display:block; font-size:13px; font-weight:500; color:#A1A1AA; margin-bottom:8px; }
      .input{
        width:100%; padding:12px 14px; background:#12121F;
        border:1px solid rgba(255,255,255,0.08); border-radius:12px;
        color:#fff; font-size:14px; font-family:'DM Sans',sans-serif;
        outline:none; transition:border-color 0.15s, box-shadow 0.15s;
      }
      .input:focus{ border-color:rgba(255,79,121,0.5); box-shadow:0 0 0 3px rgba(255,79,121,0.08); }
      .input::placeholder{ color:#52526E; }
      .input--pad-r{ padding-right:44px; }
      .input--error{ border-color:rgba(255,107,107,0.5) !important; }

      .input-wrap{ position:relative; }
      .eye-btn{ position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:#52526E; cursor:pointer; padding:4px; display:flex; align-items:center; transition:color 0.15s; }
      .eye-btn:hover{ color:#A1A1AA; }

      .strength-row{ display:flex; align-items:center; gap:8px; margin-top:8px; }
      .strength-bars{ display:flex; gap:4px; flex:1; }
      .strength-bar{ height:3px; flex:1; border-radius:2px; transition:background 0.3s; }
      .strength-label{ font-size:11px; font-weight:500; min-width:36px; }
      .field-error{ font-size:11px; color:#FF6B6B; margin-top:5px; }

      .btn-primary{
        width:100%; padding:13px; background:#FF4F79; border:none; border-radius:12px;
        color:#fff; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif;
        cursor:pointer; transition:all 0.15s;
      }
      .btn-primary:hover:not(:disabled){ background:#FF6B8F; transform:translateY(-1px); box-shadow:0 8px 24px rgba(255,79,121,0.3); }
      .btn-primary:disabled{ opacity:0.6; cursor:not-allowed; }

      .btn-loading{ display:flex; align-items:center; justify-content:center; gap:8px; }
      .spinner{ width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
      @keyframes spin{ to{ transform:rotate(360deg); } }

      .link{ color:#FF4F79; text-decoration:none; font-size:13px; }
      .link:hover{ opacity:0.8; }
      .switch-text{ text-align:center; margin-top:20px; font-size:14px; color:#A1A1AA; }
    `}</style>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}