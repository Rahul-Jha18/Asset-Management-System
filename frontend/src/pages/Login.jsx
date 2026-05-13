// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginApi } from "../services/authService";
import NepalLifeLogo from "../assets/nepallife.png";

/* ─── Google Fonts ─── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const NL_BLUE        = "#0B5CAB";
const NL_BLUE2       = "#1474F3";
const NL_RED         = "#f31225ef";
const NL_GRADIENT    = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 0%, ${NL_BLUE2} 60%, ${NL_RED} 100%)`;

const LOGIN_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8; --blue-900:#1e3a8a;
    --green-50:#f0fdf4; --green-200:#bbf7d0; --green-600:#16a34a;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
    --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb;
    --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
    --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
    --shadow-lg:0 8px 16px rgba(0,0,0,0.08),0 24px 48px rgba(0,0,0,0.12);
    --radius:10px; --radius-lg:14px; --radius-xl:18px;
    --nl-blue:${NL_BLUE}; --nl-blue-2:${NL_BLUE2}; --nl-red:${NL_RED}; --nl-ink:#0F172A;
  }

  @keyframes floaty    { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse-glow {
    0%,100%{ box-shadow:0 0 0 0 rgba(20,116,243,0); }
    50%{ box-shadow:0 0 0 6px rgba(20,116,243,0.12); }
  }
  @keyframes orb-drift {
    0%   { transform: translate(0, 0)   scale(1); }
    33%  { transform: translate(40px, -30px) scale(1.08); }
    66%  { transform: translate(-25px, 20px) scale(0.96); }
    100% { transform: translate(0, 0)   scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position: 200% center; }
  }

  /* ─── Root ─── */
  .lg-root {
    font-family:'DM Sans',sans-serif;
    min-height:100vh;
    display:flex;
    color:var(--gray-900);
    position:relative;
    overflow:hidden;
  }

  /* ─── Left panel (branding) ─── */
  .lg-left {
    flex:1;
    background:linear-gradient(168deg,#060e1d 0%,#0e2142 40%,#0a1628 75%,#0f2035 100%);
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:48px 40px;
    position:relative;
    overflow:hidden;
    min-height:100vh;
  }
  /* glowing orbs */
  .lg-left::before {
    content:'';
    position:absolute; top:-60px; left:-60px;
    width:320px; height:320px; border-radius:50%;
    background:radial-gradient(circle,rgba(20,116,243,0.22) 0%,transparent 68%);
    animation:orb-drift 14s ease-in-out infinite;
    pointer-events:none;
  }
  .lg-left::after {
    content:'';
    position:absolute; bottom:-40px; right:-40px;
    width:260px; height:260px; border-radius:50%;
    background:radial-gradient(circle,rgba(243,18,37,0.18) 0%,transparent 68%);
    animation:orb-drift 18s ease-in-out infinite reverse;
    pointer-events:none;
  }
  .lg-left-inner {
    position:relative; z-index:2;
    display:flex; flex-direction:column; align-items:center;
    gap:28px; text-align:center; max-width:340px;
  }
  .lg-logo {
    width:100px; height:100px;
    filter:drop-shadow(0 12px 32px rgba(11,92,171,0.55)) drop-shadow(0 2px 8px rgba(0,0,0,0.4));
    animation:floaty 5s ease-in-out infinite;
  }
  .lg-brand-badge {
    display:inline-flex; align-items:center; gap:7px;
    background:rgba(20,116,243,0.15); border:1px solid rgba(20,116,243,0.35);
    color:rgba(147,197,253,0.9); border-radius:999px;
    padding:5px 14px; font-size:10px; font-weight:800;
    letter-spacing:0.14em; text-transform:uppercase;
    font-family:'Outfit',sans-serif;
  }
  .lg-brand-badge-dot {
    width:6px; height:6px; border-radius:50%;
    background:${NL_BLUE2}; box-shadow:0 0 8px rgba(20,116,243,0.8);
  }
  .lg-brand-title {
    font-family:'Syne',sans-serif;
    font-size:clamp(1.6rem,3.5vw,2.4rem);
    font-weight:900; line-height:1.1;
    letter-spacing:-0.03em;
  }
  .lg-brand-title .blue { color:${NL_BLUE2}; }
  .lg-brand-title .red  { color:${NL_RED};   }
  .lg-brand-title .dim  { color:rgba(255,255,255,0.55); font-weight:700; }
  .lg-brand-divider {
    width:52px; height:3px; border-radius:999px;
    background:${NL_GRADIENT_90};
    margin:0 auto;
  }
  .lg-brand-tagline {
    font-size:13.5px; color:rgba(255,255,255,0.45);
    line-height:1.65; font-family:'DM Sans',sans-serif;
    max-width:280px;
  }
  .lg-brand-tagline strong { color:rgba(255,255,255,0.72); font-weight:600; }
  .lg-nepali {
    font-size:11px; color:rgba(255,255,255,0.3);
    font-weight:700; letter-spacing:0.04em; margin-top:-12px;
  }

  /* stats strip at bottom of left panel */
  .lg-stats {
    position:absolute; bottom:32px; left:40px; right:40px;
    display:flex; justify-content:center; gap:24px; z-index:2;
  }
  .lg-stat-item {
    display:flex; flex-direction:column; align-items:center; gap:2px;
  }
  .lg-stat-val {
    font-family:'Outfit',sans-serif; font-size:18px; font-weight:900;
    background:${NL_GRADIENT_90}; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .lg-stat-lbl {
    font-size:10px; color:rgba(255,255,255,0.35); font-weight:600;
    text-transform:uppercase; letter-spacing:0.1em;
    font-family:'Outfit',sans-serif;
  }
  .lg-stat-sep { width:1px; background:rgba(255,255,255,0.1); align-self:stretch; }

  /* ─── Right panel (form) ─── */
  .lg-right {
    width:420px; flex-shrink:0;
    background:var(--gray-50);
    display:flex; flex-direction:column;
    align-items:stretch; justify-content:center;
    padding:40px 36px;
    position:relative;
    overflow-y:auto;
  }
  @media(max-width:768px) {
    .lg-left { display:none; }
    .lg-right { width:100%; padding:32px 22px; justify-content:flex-start; padding-top:48px; }
  }

  /* ─── Form card ─── */
  .lg-card {
    background:white;
    border:1.5px solid var(--gray-200);
    border-radius:var(--radius-xl);
    box-shadow:var(--shadow-lg);
    overflow:hidden;
    animation:scaleIn 0.35s cubic-bezier(0.34,1.2,0.64,1) both;
  }

  /* gradient top stripe */
  .lg-card-stripe {
    height:4px;
    background:${NL_GRADIENT};
  }

  .lg-card-header {
    padding:28px 28px 0;
    text-align:center;
  }
  .lg-card-icon {
    width:52px; height:52px; border-radius:16px;
    background:${NL_GRADIENT};
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 16px;
    box-shadow:0 6px 20px rgba(11,92,171,0.3);
    font-size:22px;
  }
  .lg-card-title {
    font-family:'Syne',sans-serif; font-weight:900;
    font-size:1.5rem; color:var(--gray-900);
    letter-spacing:-0.025em; line-height:1.1;
    margin-bottom:6px;
  }
  .lg-card-sub {
    font-size:12.5px; color:var(--gray-400);
    font-weight:500; line-height:1.55;
    margin-bottom:0;
  }

  .lg-card-body {
    padding:24px 28px 28px;
    display:flex; flex-direction:column; gap:16px;
  }

  /* ─── Fields ─── */
  .lg-field { display:flex; flex-direction:column; gap:6px; }
  .lg-label {
    font-size:11.5px; font-weight:700; color:var(--gray-700);
    text-transform:uppercase; letter-spacing:0.06em;
    font-family:'Outfit',sans-serif;
    display:flex; align-items:center; gap:5px;
  }
  .lg-input {
    width:100%; background:white; border:1.5px solid #cbd5e1;
    border-radius:var(--radius); padding:11px 14px 11px 40px;
    color:var(--gray-900); font-size:14px;
    font-family:'DM Sans',sans-serif; outline:none;
    transition:all 0.18s ease;
    box-shadow:var(--shadow-sm);
  }
  .lg-input:hover { border-color:#94a3b8; }
  .lg-input:focus {
    border-color:${NL_BLUE};
    box-shadow:0 0 0 3px rgba(11,92,171,0.12);
  }
  .lg-input::placeholder { color:#94a3b8; font-style:italic; }
  .lg-input-wrap { position:relative; }
  .lg-input-icon {
    position:absolute; left:13px; top:50%; transform:translateY(-50%);
    color:var(--gray-400); pointer-events:none; display:flex;
    transition:color 0.18s;
  }
  .lg-input-wrap:focus-within .lg-input-icon { color:${NL_BLUE}; }
  .lg-input-wrap:focus-within .lg-input { border-color:${NL_BLUE}; }

  /* password toggle */
  .lg-eye-btn {
    position:absolute; right:12px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer; color:var(--gray-400);
    padding:2px; display:flex; align-items:center; transition:color 0.15s;
  }
  .lg-eye-btn:hover { color:${NL_BLUE}; }

  /* ─── Remember / forgot row ─── */
  .lg-row {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
  }
  .lg-remember {
    display:flex; align-items:center; gap:7px; cursor:pointer;
    font-size:12.5px; color:var(--gray-600); font-weight:500; user-select:none;
  }
  .lg-remember input[type=checkbox] {
    width:15px; height:15px; accent-color:${NL_BLUE};
    border:1.5px solid var(--gray-300); border-radius:4px; cursor:pointer;
  }
  .lg-forgot {
    font-size:12.5px; color:${NL_BLUE}; font-weight:700;
    text-decoration:none; font-family:'Outfit',sans-serif;
    letter-spacing:0.01em; transition:color 0.15s;
  }
  .lg-forgot:hover { color:${NL_BLUE2}; text-decoration:underline; }

  /* ─── Submit button ─── */
  .lg-btn-submit {
    width:100%; padding:13px;
    background:${NL_GRADIENT};
    border:none; border-radius:var(--radius); cursor:pointer;
    color:white; font-size:14px; font-weight:700;
    font-family:'Outfit',sans-serif; letter-spacing:0.04em;
    display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow:0 4px 16px rgba(11,92,171,0.35);
    transition:all 0.22s ease;
    position:relative; overflow:hidden;
  }
  .lg-btn-submit::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.1),transparent);
    pointer-events:none;
  }
  .lg-btn-submit:hover:not(:disabled) {
    transform:translateY(-2px);
    box-shadow:0 8px 24px rgba(11,92,171,0.45);
  }
  .lg-btn-submit:active:not(:disabled) { transform:translateY(0); }
  .lg-btn-submit:disabled { opacity:0.72; cursor:not-allowed; }
  .lg-btn-submit.loading { animation:pulse-glow 1.4s ease infinite; }

  /* spinner */
  .lg-spinner {
    width:16px; height:16px; border-radius:50%;
    border:2px solid rgba(255,255,255,0.3);
    border-top-color:white;
    animation:spin 0.7s linear infinite; flex-shrink:0;
  }

  /* ─── Error alert ─── */
  .lg-error {
    background:var(--red-50); border:1.5px solid var(--red-100);
    border-radius:var(--radius); padding:10px 14px;
    display:flex; align-items:flex-start; gap:9px;
    animation:slideDown 0.22s ease;
  }
  .lg-error-icon {
    width:18px; height:18px; border-radius:50%;
    background:var(--red-500); color:white;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:900; flex-shrink:0; margin-top:1px;
  }
  .lg-error-text { font-size:12.5px; color:var(--red-600); font-weight:600; line-height:1.5; }

  /* ─── Divider ─── */
  .lg-divider {
    display:flex; align-items:center; gap:10px;
    font-size:11px; color:var(--gray-400); font-weight:600;
    text-transform:uppercase; letter-spacing:0.08em;
    font-family:'Outfit',sans-serif;
  }
  .lg-divider::before, .lg-divider::after {
    content:''; flex:1; height:1px; background:var(--gray-200);
  }

  /* ─── Footer note ─── */
  .lg-card-foot {
    padding:16px 28px 20px;
    background:var(--gray-50);
    border-top:1.5px solid var(--gray-100);
    text-align:center;
  }
  .lg-foot-text {
    font-size:11.5px; color:var(--gray-400); font-weight:500; line-height:1.6;
  }
  .lg-foot-text strong { color:var(--gray-600); }

  /* mobile branding strip (shown only when left panel is hidden) */
  .lg-mobile-brand {
    display:none;
    padding:24px 22px 0;
    flex-direction:column; align-items:center; gap:10px;
    text-align:center; margin-bottom:8px;
  }
  .lg-mobile-logo { width:60px; height:60px; }
  .lg-mobile-title {
    font-family:'Syne',sans-serif; font-weight:900; font-size:1.3rem;
    letter-spacing:-0.02em; color:var(--gray-900);
  }
  .lg-mobile-title .blue { color:${NL_BLUE}; }
  .lg-mobile-title .red  { color:${NL_RED};  }
  @media(max-width:768px) { .lg-mobile-brand { display:flex; } }

  /* scrollbar */
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }
`;

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ims_creds");
      if (saved) {
        const creds = JSON.parse(saved);
        setEmail(creds.email || "");
        setPassword(creds.password || "");
        setRemember(true);
      }
    } catch (err) {
      console.warn("Failed to load saved credentials", err);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      if (remember) {
        localStorage.setItem("ims_creds", JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem("ims_creds");
      }
      login(data, remember);
      if (data.role === "admin" || data.role === "subadmin") {
        navigate("/AdminRequests");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{FONTS}{LOGIN_STYLES}</style>

      <div className="lg-root">

        {/* ── Left branding panel ── */}
        <div className="lg-left">
          <div className="lg-left-inner">
            <div className="lg-brand-badge">
              <span className="lg-brand-badge-dot" />
              Asset Management System
            </div>

            <img src={NepalLifeLogo} alt="Nepal Life Insurance" className="lg-logo" />

            <div>
              <div className="lg-brand-title">
                <span className="blue">NEPAL</span>
                <span className="red">LIFE</span>
                {" "}
                <span className="dim">Insurance</span>
              </div>
              <div className="lg-nepali">"किनकी जीवन अमूल्य छ"</div>
            </div>

            <div className="lg-brand-divider" />

            <p className="lg-brand-tagline">
              <strong>AssetIMS</strong> — Centralized IT asset management
              across all branches. Track, request, and manage assets with ease.
            </p>

            {/* decorative corner dots */}
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:7,
              opacity:0.18, marginTop:8,
            }}>
              {Array.from({ length:25 }).map((_,i) => (
                <div key={i} style={{ width:4, height:4, borderRadius:"50%", background:"white" }} />
              ))}
            </div>
          </div>

          {/* stats strip */}
          <div className="lg-stats">
            {[
              { val:"65+",  lbl:"Branches"  },
              { val:"sep"                    },
              { val:"2K+",  lbl:"Assets"    },
              { val:"sep"                    },
              { val:"100%", lbl:"Uptime"    },
            ].map((s, i) =>
              s.val === "sep"
                ? <div key={i} className="lg-stat-sep" />
                : (
                  <div key={i} className="lg-stat-item">
                    <div className="lg-stat-val">{s.val}</div>
                    <div className="lg-stat-lbl">{s.lbl}</div>
                  </div>
                )
            )}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="lg-right">
          {/* mobile-only branding */}
          <div className="lg-mobile-brand">
            <img src={NepalLifeLogo} alt="Nepal Life Insurance" className="lg-mobile-logo" />
            <div className="lg-mobile-title">
              <span className="blue">NEPAL</span>
              <span className="red">LIFE</span>
              {" "}AssetIMS
            </div>
          </div>

          <div className="lg-card">
            {/* top gradient stripe */}
            <div className="lg-card-stripe" />

            {/* header */}
            <div className="lg-card-header">
              <div className="lg-card-icon">🔐</div>
              <div className="lg-card-title">Welcome back</div>
              <div className="lg-card-sub">
                Sign in to your AssetIMS account to continue
              </div>
            </div>

            {/* body */}
            <div className="lg-card-body">

              {/* error */}
              {error && (
                <div className="lg-error">
                  <div className="lg-error-icon">!</div>
                  <div className="lg-error-text">{error}</div>
                </div>
              )}

              <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* email */}
                <div className="lg-field">
                  <label className="lg-label">
                    📧 Email Address
                  </label>
                  <div className="lg-input-wrap">
                    <span className="lg-input-icon">
                      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </span>
                    <input
                      type="email"
                      className="lg-input"
                      placeholder="you@nepallife.com.np"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* password */}
                <div className="lg-field">
                  <label className="lg-label">
                    🔒 Password
                  </label>
                  <div className="lg-input-wrap">
                    <span className="lg-input-icon">
                      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      className="lg-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      style={{ paddingRight:40 }}
                    />
                    <button type="button" className="lg-eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                      {showPass
                        ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                          </svg>
                        : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                      }
                    </button>
                  </div>
                </div>

                {/* remember + forgot */}
                <div className="lg-row">
                  <label className="lg-remember">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="lg-forgot">
                    Forgot password?
                  </Link>
                </div>

                {/* submit */}
                <button
                  type="submit"
                  className={`lg-btn-submit${loading ? " loading" : ""}`}
                  disabled={loading}
                >
                  {loading
                    ? <><div className="lg-spinner" />Signing in…</>
                    : <>
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                        </svg>
                        Sign In to AssetIMS
                      </>
                  }
                </button>

              </form>
            </div>

            {/* footer */}
            <div className="lg-card-foot">
              <p className="lg-foot-text">
                Secure access for <strong>Nepal Life Insurance Co. Ltd.</strong> staff only.
                <br />
                Unauthorized access is strictly prohibited.
              </p>
            </div>
          </div>

          {/* version stamp */}
          <div style={{
            textAlign:"center", marginTop:20,
            fontSize:11, color:"var(--gray-400)", fontFamily:"Outfit,sans-serif",
            fontWeight:600, letterSpacing:"0.06em",
          }}>
            AssetIMS v2.0 &nbsp;·&nbsp; © {new Date().getFullYear()} Nepal Life Insurance
          </div>
        </div>

      </div>
    </>
  );
}