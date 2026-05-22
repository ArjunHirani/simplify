// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

type Step = 1 | 2;

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();

  const [step, setStep]               = useState<Step>(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", upiId: "",
  });

  const update = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError("");
    };

  const validateStep1 = (): string | null => {
    if (!form.fullName.trim())           return "Full name is required.";
    if (!form.email.includes("@"))       return "Enter a valid email address.";
    if (form.password.length < 8)        return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        upiId: form.upiId || undefined,
      });
      // useAuth's register() calls router.push("/dashboard") on success
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strengthScore];
  const strengthColor = ["", "#FF6B6B", "#EF9F27", "#4ADE80", "#4ADE80"][strengthScore];

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-left">
        <div>
          <span className="brand-logo">Simplify<span className="brand-dot">.</span></span>
          <p className="brand-tagline">Split bills. Not friendships.</p>
        </div>

        <div className="steps-preview">
          <StepItem num={1} title="Account details" sub="Email & password" active={step >= 1} done={step > 1} />
          <div className="step-line" />
          <StepItem num={2} title="Profile setup" sub="UPI ID & preferences" active={step >= 2} done={false} />
        </div>

        <p className="left-footer">Free forever · No credit card required</p>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-box">
          {/* Progress bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>

          <div className="auth-header">
            <h1 className="auth-title">{step === 1 ? "Create your account" : "Almost there!"}</h1>
            <p className="auth-sub">
              {step === 1 ? "Join thousands splitting smarter" : "Add your UPI ID to receive payments easily"}
            </p>
          </div>

          {error && (
            <div className="banner banner--error">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <button className="btn-google" type="button" onClick={loginWithGoogle}>
                <GoogleIcon />
                Sign up with Google
              </button>
              <div className="divider"><span>or sign up with email</span></div>

              <form onSubmit={handleNext} noValidate>
                <div className="field">
                  <label htmlFor="fullName" className="label">Full name</label>
                  <input id="fullName" type="text" className="input" placeholder="Arjun Kumar"
                    value={form.fullName} onChange={update("fullName")} autoComplete="name" autoFocus />
                </div>

                <div className="field">
                  <label htmlFor="email" className="label">Email address</label>
                  <input id="email" type="email" className="input" placeholder="arjun@example.com"
                    value={form.email} onChange={update("email")} autoComplete="email" />
                </div>

                <div className="field">
                  <label htmlFor="password" className="label">Password</label>
                  <div className="input-wrap">
                    <input id="password" type={showPassword ? "text" : "password"}
                      className="input input--pad-r" placeholder="Min. 8 characters"
                      value={form.password} onChange={update("password")} autoComplete="new-password" />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {form.password.length > 0 && (
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
                  <label htmlFor="confirm" className="label">Confirm password</label>
                  <div className="input-wrap">
                    <input id="confirm" type={showConfirm ? "text" : "password"}
                      className={`input input--pad-r ${form.confirmPassword && form.confirmPassword !== form.password ? "input--error" : ""}`}
                      placeholder="Repeat your password"
                      value={form.confirmPassword} onChange={update("confirmPassword")} autoComplete="new-password" />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {form.confirmPassword && form.confirmPassword !== form.password && (
                    <p className="field-error">Passwords don&apos;t match</p>
                  )}
                </div>

                <button type="submit" className="btn-primary">Continue →</button>
              </form>

              <p className="switch-text">
                Already have an account?{" "}
                <Link href="/login" className="link link--bold">Sign in</Link>
              </p>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleRegister} noValidate>
              {/* Avatar upload */}
              <div className="avatar-upload">
                <div className="avatar-circle">
                  <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div className="avatar-label">Profile photo</div>
                  <div className="avatar-hint">Optional · JPG or PNG</div>
                </div>
                <button type="button" className="avatar-btn">Upload</button>
              </div>

              <div className="field">
                <label htmlFor="upiId" className="label label--row">
                  UPI ID
                  <span className="badge-recommended">Recommended</span>
                </label>
                <input id="upiId" type="text" className="input" placeholder="yourname@upi"
                  value={form.upiId} onChange={update("upiId")} />
                <p className="field-hint">Friends will use this to pay you when settling up.</p>
              </div>

              {/* Summary */}
              <div className="summary-card">
                <div className="summary-row">
                  <span className="summary-key">Name</span>
                  <span className="summary-val">{form.fullName}</span>
                </div>
                <div className="summary-row summary-row--border">
                  <span className="summary-key">Email</span>
                  <span className="summary-val">{form.email}</span>
                </div>
              </div>

              <p className="terms-text">
                By creating an account you agree to our{" "}
                <a href="#" className="link">Terms of Service</a> and{" "}
                <a href="#" className="link">Privacy Policy</a>.
              </p>

              <div className="btn-row">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? <span className="btn-loading"><span className="spinner" aria-hidden />Creating...</span>
                    : "Create account"}
                </button>
              </div>
            </form>
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

        .steps-preview{ position:relative; z-index:1; }
        .step-line{ width:2px; height:32px; background:rgba(255,255,255,0.1); margin:8px 0 8px 15px; }
        .left-footer{ font-size:12px; color:#52526E; position:relative; z-index:1; }

        .auth-right{ flex:1; display:flex; align-items:center; justify-content:center; padding:32px 24px; }
        .auth-box{ width:100%; max-width:420px; animation:fadeIn 0.35s ease; }
        @keyframes fadeIn{ from{ opacity:0; transform:translateY(14px); } to{ opacity:1; transform:translateY(0); } }

        .progress-bar{ height:3px; background:rgba(255,255,255,0.08); border-radius:4px; margin-bottom:28px; overflow:hidden; }
        .progress-fill{ height:100%; background:#FF4F79; border-radius:4px; transition:width 0.4s cubic-bezier(0.4,0,0.2,1); }

        .auth-header{ margin-bottom:24px; }
        .auth-title{ font-family:'Syne',sans-serif; font-size:26px; font-weight:700; color:#fff; letter-spacing:-0.5px; margin-bottom:6px; }
        .auth-sub{ font-size:14px; color:#A1A1AA; }

        .banner{ display:flex; align-items:center; gap:8px; border-radius:10px; padding:10px 14px; font-size:13px; margin-bottom:20px; border:1px solid; }
        .banner--error{ background:rgba(255,107,107,0.1); border-color:rgba(255,107,107,0.25); color:#FF6B6B; }

        .btn-google{
          width:100%; display:flex; align-items:center; justify-content:center; gap:10px;
          padding:12px; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1); border-radius:12px;
          color:#fff; font-size:14px; font-weight:500; font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all 0.15s;
        }
        .btn-google:hover{ background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.2); }

        .divider{ display:flex; align-items:center; gap:12px; margin:20px 0; color:#52526E; font-size:12px; }
        .divider::before,.divider::after{ content:''; flex:1; height:1px; background:rgba(255,255,255,0.07); }

        .field{ margin-bottom:16px; }
        .label{ display:block; font-size:13px; font-weight:500; color:#A1A1AA; margin-bottom:8px; }
        .label--row{ display:flex; align-items:center; gap:8px; }

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
        .field-hint{ font-size:11.5px; color:#52526E; margin-top:6px; }

        .link{ font-size:12px; color:#FF4F79; text-decoration:none; }
        .link:hover{ opacity:0.8; }
        .link--bold{ font-size:14px; font-weight:500; }

        .badge-recommended{ font-size:10px; font-weight:600; background:rgba(74,222,128,0.12); color:#4ADE80; padding:2px 8px; border-radius:20px; }

        .avatar-upload{ display:flex; align-items:center; gap:14px; padding:14px; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); border-radius:12px; margin-bottom:20px; }
        .avatar-circle{ width:52px; height:52px; border-radius:50%; background:rgba(255,79,121,0.1); border:1px solid rgba(255,79,121,0.2); display:flex; align-items:center; justify-content:center; color:#FF4F79; flex-shrink:0; }
        .avatar-label{ font-size:13px; font-weight:500; color:#fff; }
        .avatar-hint{ font-size:11px; color:#52526E; margin-top:2px; }
        .avatar-btn{ margin-left:auto; padding:6px 14px; background:transparent; border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#A1A1AA; font-size:12px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.15s; }
        .avatar-btn:hover{ border-color:rgba(255,255,255,0.3); color:#fff; }

        .summary-card{ background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:14px 16px; margin-bottom:16px; }
        .summary-row{ display:flex; justify-content:space-between; font-size:13px; padding:4px 0; }
        .summary-row--border{ border-top:1px solid rgba(255,255,255,0.05); margin-top:6px; padding-top:10px; }
        .summary-key{ color:#A1A1AA; }
        .summary-val{ color:#fff; font-weight:500; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        .terms-text{ font-size:12px; color:#52526E; margin-bottom:20px; line-height:1.6; }

        .btn-row{ display:flex; gap:10px; }
        .btn-secondary{ padding:13px 18px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#A1A1AA; font-size:14px; font-weight:500; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .btn-secondary:hover{ background:rgba(255,255,255,0.08); color:#fff; }

        .btn-primary{ flex:1; padding:13px; background:#FF4F79; border:none; border-radius:12px; color:#fff; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.15s; }
        .btn-primary:hover:not(:disabled){ background:#FF6B8F; transform:translateY(-1px); box-shadow:0 8px 24px rgba(255,79,121,0.3); }
        .btn-primary:disabled{ opacity:0.6; cursor:not-allowed; }

        .btn-loading{ display:flex; align-items:center; justify-content:center; gap:8px; }
        .spinner{ width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
        @keyframes spin{ to{ transform:rotate(360deg); } }

        .switch-text{ text-align:center; margin-top:24px; font-size:14px; color:#A1A1AA; }
      `}</style>
    </div>
  );
}

function StepItem({ num, title, sub, active, done }: { num:number; title:string; sub:string; active:boolean; done:boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
      <div style={{
        width:32, height:32, borderRadius:"50%", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:13, fontWeight:600,
        background: active ? "rgba(255,79,121,0.2)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? "rgba(255,79,121,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: active ? "#FF4F79" : "#52526E",
      }}>
        {done ? "✓" : num}
      </div>
      <div>
        <div style={{ fontSize:14, fontWeight:500, color: active ? "#fff" : "#52526E", marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:12, color:"#A1A1AA" }}>{sub}</div>
      </div>
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