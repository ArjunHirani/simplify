// src/app/(auth)/forgot-password/page.tsx
"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

type State = "idle" | "loading" | "sent" | "error";

function ForgotPasswordPageContent() {
  const { forgotPassword } = useAuth();
  const [email, setEmail]     = useState("");
  const [state, setState]     = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setErrorMsg("Enter a valid email address."); return; }

    setState("loading");
    setErrorMsg("");
    try {
      await forgotPassword(email);
      setState("sent");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setState("error");
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div>
          <span className="brand-logo">Simplify<span className="brand-dot">.</span></span>
          <p className="brand-tagline">Split bills. Not friendships.</p>
        </div>
        <div className="auth-left__center">
          <div className="lock-icon" aria-hidden>🔐</div>
          <p className="left-copy">We&apos;ll send a secure reset link to your inbox. It expires in 15 minutes.</p>
        </div>
        <p className="left-footer">Your account is safe with us.</p>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-box">

          {/* ── STATE: Email sent ── */}
          {state === "sent" ? (
            <div className="sent-state">
              <div className="sent-icon" aria-hidden>📬</div>
              <h1 className="auth-title">Check your inbox</h1>
              <p className="auth-sub">
                We sent a password reset link to <strong className="highlight">{email}</strong>.
                Check your spam folder if you don&apos;t see it.
              </p>

              <div className="info-card">
                <div className="info-row">
                  <span className="info-dot" />
                  Link expires in <strong>15 minutes</strong>
                </div>
                <div className="info-row">
                  <span className="info-dot" />
                  Only the latest link is valid
                </div>
                <div className="info-row">
                  <span className="info-dot" />
                  Check spam / promotions folder
                </div>
              </div>

              <button
                className="btn-secondary full-width"
                onClick={() => { setState("idle"); setEmail(""); }}
              >
                Try a different email
              </button>

              <p className="switch-text">
                Remembered it?{" "}
                <Link href="/login" className="link link--bold">Sign in</Link>
              </p>
            </div>
          ) : (
            /* ── STATE: Form ── */
            <>
              {/* Back arrow */}
              <Link href="/login" className="back-link">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back to login
              </Link>

              <div className="auth-header">
                <h1 className="auth-title">Forgot password?</h1>
                <p className="auth-sub">
                  No worries. Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {(state === "error") && (
                <div className="banner banner--error">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="email" className="label">Email address</label>
                  <input
                    id="email" type="email" className="input"
                    placeholder="arjun@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); setState("idle"); }}
                    autoComplete="email" autoFocus
                  />
                  {errorMsg && state !== "error" && <p className="field-error">{errorMsg}</p>}
                </div>

                <button type="submit" className="btn-primary" disabled={state === "loading"}>
                  {state === "loading"
                    ? <span className="btn-loading"><span className="spinner" aria-hidden />Sending link...</span>
                    : "Send reset link"}
                </button>
              </form>

              <p className="switch-text" style={{ marginTop: "20px" }}>
                Remembered it?{" "}
                <Link href="/login" className="link link--bold">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
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

        .auth-left__center{ position:relative; z-index:1; text-align:center; }
        .lock-icon{ font-size:56px; margin-bottom:20px; display:block; }
        .left-copy{ font-size:14px; color:#A1A1AA; line-height:1.7; }
        .left-footer{ font-size:12px; color:#52526E; position:relative; z-index:1; }

        /* Right */
        .auth-right{ flex:1; display:flex; align-items:center; justify-content:center; padding:32px 24px; }
        .auth-box{ width:100%; max-width:420px; animation:fadeIn 0.4s ease; }
        @keyframes fadeIn{ from{ opacity:0; transform:translateY(16px); } to{ opacity:1; transform:translateY(0); } }

        /* Back link */
        .back-link{
          display:inline-flex; align-items:center; gap:6px;
          font-size:13px; color:#A1A1AA; text-decoration:none;
          margin-bottom:28px; transition:color 0.15s;
        }
        .back-link:hover{ color:#fff; }

        .auth-header{ margin-bottom:28px; }
        .auth-title{ font-family:'Syne',sans-serif; font-size:28px; font-weight:700; color:#fff; letter-spacing:-0.5px; margin-bottom:8px; }
        .auth-sub{ font-size:14px; color:#A1A1AA; line-height:1.6; }

        .banner{ display:flex; align-items:center; gap:8px; border-radius:10px; padding:10px 14px; font-size:13px; margin-bottom:20px; border:1px solid; }
        .banner--error{ background:rgba(255,107,107,0.1); border-color:rgba(255,107,107,0.25); color:#FF6B6B; }

        .field{ margin-bottom:20px; }
        .label{ display:block; font-size:13px; font-weight:500; color:#A1A1AA; margin-bottom:8px; }
        .input{
          width:100%; padding:12px 14px; background:#12121F;
          border:1px solid rgba(255,255,255,0.08); border-radius:12px;
          color:#fff; font-size:14px; font-family:'DM Sans',sans-serif;
          outline:none; transition:border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus{ border-color:rgba(255,79,121,0.5); box-shadow:0 0 0 3px rgba(255,79,121,0.08); }
        .input::placeholder{ color:#52526E; }
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

        .link{ font-size:12px; color:#FF4F79; text-decoration:none; }
        .link:hover{ opacity:0.8; }
        .link--bold{ font-size:14px; font-weight:500; }
        .switch-text{ text-align:center; font-size:14px; color:#A1A1AA; }

        /* Sent state */
        .sent-state{ text-align:center; animation:fadeIn 0.4s ease; }
        .sent-icon{ font-size:56px; margin-bottom:20px; display:block; }
        .highlight{ color:#fff; font-weight:500; }
        .info-card{
          background:#17172B; border:1px solid rgba(255,255,255,0.07);
          border-radius:12px; padding:16px 20px;
          text-align:left; margin:24px 0;
          display:flex; flex-direction:column; gap:10px;
        }
        .info-row{ display:flex; align-items:center; gap:10px; font-size:13px; color:#A1A1AA; }
        .info-dot{ width:6px; height:6px; border-radius:50%; background:#FF4F79; flex-shrink:0; }
        .info-row strong{ color:#fff; font-weight:500; }

        .btn-secondary{
          padding:12px; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1); border-radius:12px;
          color:#A1A1AA; font-size:14px; font-weight:500; font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all 0.15s; margin-bottom:20px;
        }
        .btn-secondary:hover{ background:rgba(255,255,255,0.08); color:#fff; }
        .full-width{ width:100%; }
      `}</style>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}