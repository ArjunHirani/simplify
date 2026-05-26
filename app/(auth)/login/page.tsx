// src/app/(auth)/login/page.tsx
"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function LoginPageContent() {
  const { login, loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [successMsg, setSuccessMsg]     = useState("");

  // Show "Password reset successful" banner when redirected from reset flow
  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccessMsg("Password reset successfully! Sign in with your new password.");
    }
    if (searchParams.get("verified") === "1") {
      setSuccessMsg("Email verified! You can now sign in.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password)      { setError("Password is required."); return; }

    setLoading(true);
    try {
      await login({ email, password });
      // useAuth's login() calls router.push("/dashboard") on success
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left decorative panel ── */}
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-logo">Simplify<span className="brand-dot">.</span></span>
          <p className="brand-tagline">Split bills. Not friendships.</p>
        </div>
        <div className="auth-illustration">
          <div className="float-card float-card--1">
            <span className="float-label">You are owed</span>
            <span className="float-amount positive">+₹3,540</span>
          </div>
          <div className="float-card float-card--2">
            <span className="float-label">Goa Trip 🌊</span>
            <span className="float-amount negative">-₹1,200</span>
          </div>
          <div className="float-card float-card--3">
            <span className="float-label">Settled ✓</span>
            <span className="float-amount positive">+₹600</span>
          </div>
        </div>
        <p className="left-footer">Trusted by 10,000+ students & travelers</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to your Simplify account</p>
          </div>

          {/* Success banner */}
          {successMsg && (
            <div className="banner banner--success">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {successMsg}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="banner banner--error">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Google */}
          <button className="btn-google" type="button" onClick={loginWithGoogle}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="divider"><span>or continue with email</span></div>

          <form onSubmit={handleLogin} noValidate>
            <div className="field">
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email" type="email" className="input"
                placeholder="arjun@example.com"
                value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoComplete="email" autoFocus
              />
            </div>

            <div className="field">
              <div className="label-row">
                <label htmlFor="password" className="label">Password</label>
                <Link href="/forgot-password" className="link">Forgot password?</Link>
              </div>
              <div className="input-wrap">
                <input
                  id="password" type={showPassword ? "text" : "password"}
                  className="input input--pad-r"
                  placeholder="Enter your password"
                  value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? <span className="btn-loading"><span className="spinner" aria-hidden />Signing in...</span>
                : "Sign in"}
            </button>
          </form>

          <p className="switch-text">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="link link--bold">Create one</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        /* ── Layout ── */
        .auth-page { min-height:100vh; display:flex; background:#0B0B1A; font-family:'DM Sans',sans-serif; }

        /* Left */
        .auth-left {
          display:none; flex-direction:column; justify-content:space-between;
          padding:48px; background:#17172B;
          border-right:1px solid rgba(255,255,255,0.06);
          position:relative; overflow:hidden;
        }
        @media(min-width:1024px){ .auth-left{ display:flex; width:45%; } }
        .auth-left::before{
          content:''; position:absolute; inset:0;
          background-image:radial-gradient(rgba(255,79,121,0.08) 1px, transparent 1px);
          background-size:28px 28px; pointer-events:none;
        }
        .auth-left::after{
          content:''; position:absolute; width:400px; height:400px; border-radius:50%;
          background:radial-gradient(circle, rgba(255,79,121,0.1) 0%, transparent 70%);
          top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none;
        }

        .brand-logo{ font-family:'Syne',sans-serif; font-size:32px; font-weight:800; color:#fff; letter-spacing:-1px; }
        .brand-dot{ color:#FF4F79; }
        .brand-tagline{ margin-top:8px; font-size:15px; color:#A1A1AA; }

        .auth-illustration{ position:relative; z-index:1; height:220px; }
        .float-card{
          position:absolute; background:#0B0B1A;
          border:1px solid rgba(255,255,255,0.1); border-radius:14px;
          padding:14px 20px; display:flex; flex-direction:column; gap:6px;
          animation:floatUp 3s ease-in-out infinite;
        }
        .float-card--1{ left:0; top:0; animation-delay:0s; }
        .float-card--2{ right:20px; top:60px; animation-delay:0.8s; }
        .float-card--3{ left:40px; bottom:0; animation-delay:1.6s; }
        @keyframes floatUp{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-10px); } }
        .float-label{ font-size:11px; color:#A1A1AA; }
        .float-amount{ font-family:'Syne',sans-serif; font-size:20px; font-weight:700; }
        .float-amount.positive{ color:#4ADE80; }
        .float-amount.negative{ color:#FF6B6B; }
        .left-footer{ font-size:12px; color:#52526E; position:relative; z-index:1; }

        /* Right */
        .auth-right{ flex:1; display:flex; align-items:center; justify-content:center; padding:32px 24px; }
        .auth-box{ width:100%; max-width:420px; animation:fadeIn 0.4s ease; }
        @keyframes fadeIn{ from{ opacity:0; transform:translateY(16px); } to{ opacity:1; transform:translateY(0); } }

        .auth-header{ margin-bottom:28px; }
        .auth-title{ font-family:'Syne',sans-serif; font-size:28px; font-weight:700; color:#fff; letter-spacing:-0.5px; margin-bottom:6px; }
        .auth-sub{ font-size:14px; color:#A1A1AA; }

        /* Banners */
        .banner{
          display:flex; align-items:center; gap:8px;
          border-radius:10px; padding:10px 14px;
          font-size:13px; margin-bottom:20px; border:1px solid;
        }
        .banner--error{ background:rgba(255,107,107,0.1); border-color:rgba(255,107,107,0.25); color:#FF6B6B; }
        .banner--success{ background:rgba(74,222,128,0.08); border-color:rgba(74,222,128,0.25); color:#4ADE80; }

        /* Google */
        .btn-google{
          width:100%; display:flex; align-items:center; justify-content:center; gap:10px;
          padding:12px; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1); border-radius:12px;
          color:#fff; font-size:14px; font-weight:500; font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all 0.15s;
        }
        .btn-google:hover{ background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.2); }

        /* Divider */
        .divider{ display:flex; align-items:center; gap:12px; margin:20px 0; color:#52526E; font-size:12px; }
        .divider::before,.divider::after{ content:''; flex:1; height:1px; background:rgba(255,255,255,0.07); }

        /* Fields */
        .field{ margin-bottom:16px; }
        .label{ display:block; font-size:13px; font-weight:500; color:#A1A1AA; margin-bottom:8px; }
        .label-row{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .label-row .label{ margin-bottom:0; }

        .input{
          width:100%; padding:12px 14px;
          background:#12121F; border:1px solid rgba(255,255,255,0.08); border-radius:12px;
          color:#fff; font-size:14px; font-family:'DM Sans',sans-serif;
          outline:none; transition:border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus{ border-color:rgba(255,79,121,0.5); box-shadow:0 0 0 3px rgba(255,79,121,0.08); }
        .input::placeholder{ color:#52526E; }
        .input--pad-r{ padding-right:44px; }
        .input-wrap{ position:relative; }
        .eye-btn{
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:#52526E; cursor:pointer; padding:4px;
          display:flex; align-items:center; transition:color 0.15s;
        }
        .eye-btn:hover{ color:#A1A1AA; }

        .link{ font-size:12px; color:#FF4F79; text-decoration:none; transition:opacity 0.15s; }
        .link:hover{ opacity:0.8; }
        .link--bold{ font-size:14px; font-weight:500; }

        /* Primary button */
        .btn-primary{
          width:100%; padding:13px; margin-top:8px;
          background:#FF4F79; border:none; border-radius:12px;
          color:#fff; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all 0.15s; letter-spacing:0.2px;
        }
        .btn-primary:hover:not(:disabled){ background:#FF6B8F; transform:translateY(-1px); box-shadow:0 8px 24px rgba(255,79,121,0.3); }
        .btn-primary:active{ transform:scale(0.99); }
        .btn-primary:disabled{ opacity:0.6; cursor:not-allowed; }

        .btn-loading{ display:flex; align-items:center; justify-content:center; gap:8px; }
        .spinner{
          width:14px; height:14px;
          border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
          border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block;
        }
        @keyframes spin{ to{ transform:rotate(360deg); } }

        .switch-text{ text-align:center; margin-top:24px; font-size:14px; color:#A1A1AA; }
      `}</style>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}