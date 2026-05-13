// src/pages/Landing.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Layout/Footer";
import NepalLifeLogo from "../assets/nepallife.png";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=Outfit:wght@400;500;600;700;800;900&display=swap');`;

const LANDING_STYLES = `
  :root {
    --nl-blue: #0B5CAB;
    --nl-blue-2: #1474F3;
    --nl-red: #E11D2E;
    --nl-bg: #F5F8FF;
    --nl-ink: #0F172A;
    --nl-grad: linear-gradient(135deg, #0B5CAB 0%, #1474F3 55%, #E11D2E 100%);
    --nl-grad-90: linear-gradient(90deg, #0B5CAB 82%, #E11D2E 100%);

    /* Fluid spacing */
    --sp-xs:  clamp(4px, 0.5vw, 8px);
    --sp-sm:  clamp(8px, 1vw, 14px);
    --sp-md:  clamp(12px, 1.5vw, 22px);
    --sp-lg:  clamp(18px, 2.2vw, 34px);
    --sp-xl:  clamp(28px, 3.5vw, 56px);
    --sp-2xl: clamp(40px, 5vw, 80px);

    /* Fluid type */
    --t-xs:  clamp(10px, 0.9vw, 12px);
    --t-sm:  clamp(12px, 1.1vw, 14px);
    --t-base:clamp(13px, 1.2vw, 15px);
    --t-lg:  clamp(15px, 1.5vw, 18px);
    --t-xl:  clamp(18px, 2vw, 24px);
    --t-2xl: clamp(22px, 3vw, 34px);
    --t-3xl: clamp(28px, 4.5vw, 52px);
  }

  @keyframes fadeInUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn     { from { opacity:0; } to { opacity:1; } }
  @keyframes blink      { 50% { opacity:0; } }
  @keyframes floaty     { 0%,100%{ transform:translateY(0) rotate(-1deg); } 50%{ transform:translateY(-10px) rotate(1deg); } }
  @keyframes scaleIn    { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
  @keyframes shimmer    { from { background-position:-200% 0; } to { background-position:200% 0; } }
  @keyframes slideRight { from { opacity:0; transform:translateX(-18px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse      { 0%,100%{opacity:1;} 50%{opacity:.45;} }
  @keyframes spin       { to { transform:rotate(360deg); } }

  .fade-up     { animation: fadeInUp  0.65s ease both; }
  .fade-up-d1  { animation: fadeInUp  0.65s 0.08s ease both; }
  .fade-up-d2  { animation: fadeInUp  0.65s 0.16s ease both; }
  .fade-up-d3  { animation: fadeInUp  0.65s 0.24s ease both; }
  .fade-up-d4  { animation: fadeInUp  0.65s 0.32s ease both; }
  .cursor-blink{ animation: blink 1s step-end infinite; }
  .scale-in    { animation: scaleIn   0.5s 0.1s ease both; }

  /* ── Grid Bg ── */
  .grid-bg {
    background-image:
      linear-gradient(rgba(11,92,171,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(11,92,171,0.035) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  /* ── Noise overlay ── */
  .page-wrap::after {
    content:''; position:fixed; inset:0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04' fill='%230B5CAB'/%3E%3C/svg%3E");
    pointer-events:none; z-index:0; opacity:0.28;
  }

  /* ══════════════════════════
     HERO
  ══════════════════════════ */
  .nl-hero-wrap {
    border: 1.5px solid rgba(11,92,171,0.12);
    border-radius: clamp(18px, 2.5vw, 28px);
    background: linear-gradient(135deg,
      rgba(11,92,171,0.09) 0%,
      rgba(255,255,255,0.88) 42%,
      rgba(225,29,46,0.07) 100%);
    box-shadow: 0 20px 70px rgba(2,32,53,0.10), 0 1px 0 rgba(255,255,255,0.7) inset;
    overflow: hidden;
    position: relative;
  }
  .nl-hero-wrap::before {
    content:''; position:absolute; inset:0;
    background:
      radial-gradient(ellipse at 12% 25%, rgba(20,116,243,0.20) 0%, transparent 52%),
      radial-gradient(ellipse at 88% 18%, rgba(225,29,46,0.14) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 90%, rgba(11,92,171,0.08) 0%, transparent 55%);
    pointer-events:none;
  }
  /* Decorative corner accent */
  .nl-hero-wrap::after {
    content:''; position:absolute;
    top: -1px; right: -1px;
    width: clamp(80px, 12vw, 160px);
    height: clamp(80px, 12vw, 160px);
    background: linear-gradient(225deg, rgba(225,29,46,0.12) 0%, transparent 60%);
    border-radius: 0 clamp(18px,2.5vw,28px) 0 0;
    pointer-events:none;
  }

  .nl-hero-inner {
    position: relative; z-index: 2;
    padding: clamp(24px, 4vw, 52px) clamp(20px, 3.5vw, 44px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(20px, 3vw, 40px);
  }

  .nl-hero-text { flex:1; min-width:0; }

  .nl-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(11,92,171,0.08);
    border: 1px solid rgba(11,92,171,0.18);
    color: var(--nl-blue);
    border-radius: 999px;
    padding: clamp(5px,0.6vw,7px) clamp(11px,1.4vw,16px);
    font-family: Outfit, sans-serif;
    font-size: var(--t-xs);
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: var(--sp-sm);
    animation: slideRight 0.5s ease both;
  }
  .nl-eyebrow-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--nl-blue-2);
    box-shadow: 0 0 10px rgba(20,116,243,0.7);
    animation: pulse 2s ease infinite;
  }

  .nl-title {
    font-family: Syne, sans-serif;
    font-weight: 900;
    font-size: var(--t-3xl);
    letter-spacing: -0.03em;
    margin: 0 0 var(--sp-xs) 0;
    color: var(--nl-ink);
    line-height: 1.05;
  }
  .nl-title .blue { color: var(--nl-blue); }
  .nl-title .red  { color: var(--nl-red); }

  .nl-nepali {
    display: block;
    font-size: clamp(13px, 1.8vw, 20px);
    color: rgba(15,23,42,0.40);
    font-weight: 700;
    margin-top: clamp(4px, 0.5vw, 8px);
    font-family: DM Sans, sans-serif;
    letter-spacing: 0.01em;
  }

  .nl-divider {
    width: clamp(36px, 5vw, 56px); height: 3px; border-radius: 999px;
    background: linear-gradient(90deg, var(--nl-blue), var(--nl-red));
    margin: clamp(10px, 1.4vw, 18px) 0;
  }

  .nl-sub {
    font-size: var(--t-base);
    color: rgba(15,23,42,0.58);
    line-height: 1.68;
    max-width: 600px;
    margin: 0 0 var(--sp-md) 0;
  }

  .nl-actions {
    display: flex;
    gap: clamp(8px, 1vw, 14px);
    flex-wrap: wrap;
    margin-bottom: var(--sp-md);
  }

  /* Typing area */
  .nl-typing {
    min-height: clamp(20px, 2.5vw, 28px);
    font-size: var(--t-sm);
    color: rgba(15,23,42,0.52);
    display: flex; align-items: center; gap: 6px;
  }
  .nl-typing-text { font-weight:700; color: rgba(15,23,42,0.72); }

  /* Logo area */
  .nl-logo-col {
    flex-shrink: 0;
    display: flex; flex-direction: column;
    align-items: center; gap: clamp(10px, 1.5vw, 18px);
  }
  .nl-logo {
    width: clamp(100px, 12vw, 170px);
    height: auto; display: block;
    filter: drop-shadow(0 10px 24px rgba(2,32,53,0.20));
    animation: floaty 5s ease-in-out infinite;
  }

  /* Live badge below logo */
  .nl-live-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: clamp(5px,0.6vw,7px) clamp(10px,1.2vw,14px);
    border-radius: 999px;
    background: rgba(34,197,94,0.10);
    border: 1px solid rgba(34,197,94,0.25);
    font-family: Outfit, sans-serif;
    font-size: var(--t-xs);
    font-weight: 800;
    color: #15803d;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }
  .nl-live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34,197,94,0.6);
    animation: pulse 1.6s ease infinite;
  }

  /* ══════════════════════════
     CTA BUTTONS
  ══════════════════════════ */
  .cta-primary {
    background: linear-gradient(135deg, var(--nl-blue), var(--nl-blue-2));
    border-radius: clamp(9px, 1vw, 12px);
    padding: clamp(9px,1.1vw,13px) clamp(16px,2vw,26px);
    font-weight: 700; font-size: var(--t-sm); color: #fff;
    text-decoration: none; display: inline-flex;
    align-items: center; gap: 7px;
    box-shadow: 0 8px 28px rgba(20,116,243,0.26);
    transition: all 0.2s ease;
    justify-content: center;
    white-space: nowrap;
    font-family: Outfit, sans-serif;
    letter-spacing: 0.01em;
  }
  .cta-primary:hover { opacity:0.92; transform:translateY(-2px); box-shadow:0 14px 38px rgba(20,116,243,0.34); }

  .cta-secondary {
    background: rgba(11,92,171,0.07);
    border: 1.5px solid rgba(11,92,171,0.20);
    border-radius: clamp(9px,1vw,12px);
    padding: clamp(9px,1.1vw,13px) clamp(16px,2vw,26px);
    font-weight: 700; font-size: var(--t-sm); color: var(--nl-blue);
    text-decoration: none; display: inline-flex;
    align-items: center; gap: 7px;
    transition: all 0.2s ease;
    justify-content: center;
    white-space: nowrap;
    font-family: Outfit, sans-serif;
  }
  .cta-secondary:hover { background:rgba(11,92,171,0.12); border-color:rgba(11,92,171,0.35); transform:translateY(-2px); }

  .cta-ghost {
    background: rgba(225,29,46,0.06);
    border: 1.5px solid rgba(225,29,46,0.22);
    border-radius: clamp(9px,1vw,12px);
    padding: clamp(9px,1.1vw,13px) clamp(16px,2vw,26px);
    font-weight: 700; font-size: var(--t-sm); color: var(--nl-red);
    text-decoration: none; display: inline-flex;
    align-items: center; gap: 7px;
    transition: all 0.2s ease;
    justify-content: center;
    white-space: nowrap;
    font-family: Outfit, sans-serif;
  }
  .cta-ghost:hover { background:rgba(225,29,46,0.11); border-color:rgba(225,29,46,0.36); transform:translateY(-2px); }

  /* ══════════════════════════
     STATS BAR
  ══════════════════════════ */
  .stat-bar {
    background: rgba(255,255,255,0.75);
    border: 1.5px solid rgba(11,92,171,0.10);
    border-radius: clamp(14px, 2vw, 22px);
    padding: clamp(16px, 2.2vw, 28px) clamp(18px, 3vw, 40px);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(90px,10vw,130px), 1fr));
    gap: clamp(12px, 2vw, 24px);
    box-shadow: 0 4px 20px rgba(2,32,53,0.07);
    backdrop-filter: blur(10px);
    animation: fadeInUp 0.7s 0.12s ease both;
    position: relative;
    overflow: hidden;
  }
  .stat-bar::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background: linear-gradient(90deg, var(--nl-blue) 0%, var(--nl-blue-2) 50%, var(--nl-red) 100%);
  }
  .stat-item {
    text-align: center;
    padding: clamp(8px, 1vw, 14px) clamp(4px, 0.5vw, 8px);
    border-radius: clamp(10px, 1.2vw, 14px);
    transition: background 0.2s ease;
    cursor: default;
  }
  .stat-item:hover { background: rgba(11,92,171,0.04); }
  .stat-sep {
    width: 1px;
    background: rgba(11,92,171,0.09);
    margin: auto 0;
    min-height: 32px;
  }
  .stat-num {
    font-family: Syne, sans-serif;
    font-size: clamp(1.3rem, 2.8vw, 2.1rem);
    font-weight: 900;
    background: linear-gradient(135deg, var(--nl-blue) 0%, var(--nl-red) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    display: block;
  }
  .stat-label {
    font-size: var(--t-xs);
    color: rgba(15,23,42,0.42);
    margin-top: 5px;
    font-family: Outfit, sans-serif;
    font-weight: 600;
    letter-spacing: 0.03em;
  }

  /* ══════════════════════════
     SECTION LABEL
  ══════════════════════════ */
  .section-label {
    font-size: var(--t-xs);
    color: var(--nl-blue);
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-family: Outfit, sans-serif;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: var(--sp-xs);
  }
  .section-label::before {
    content:'';
    width: clamp(16px, 2.5vw, 28px); height: 2px;
    background: var(--nl-grad);
    border-radius: 999px;
    display: inline-block;
  }
  .section-heading {
    font-family: Syne, sans-serif;
    font-size: var(--t-2xl);
    font-weight: 900;
    letter-spacing: -0.025em;
    color: var(--nl-ink);
    margin: 0;
    line-height: 1.1;
  }

  /* ══════════════════════════
     MODULE CARDS
  ══════════════════════════ */
  .mod-card {
    border: 1.5px solid rgba(11,92,171,0.10);
    border-radius: clamp(14px, 2vw, 22px);
    padding: clamp(18px, 2.5vw, 28px);
    display: flex; flex-direction: column; gap: clamp(12px, 1.5vw, 18px);
    backdrop-filter: blur(8px);
    background: rgba(255,255,255,0.90);
    transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.32s ease, border-color 0.22s ease;
    position: relative; overflow: hidden;
    animation: fadeInUp 0.6s ease both;
    box-shadow: 0 2px 16px rgba(2,32,53,0.06);
  }
  .mod-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background: var(--card-accent, var(--nl-blue));
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s ease;
  }
  .mod-card:hover { transform: translateY(-6px); box-shadow: 0 20px 52px rgba(2,32,53,0.12); }
  .mod-card:hover::before { transform: scaleX(1); }

  .mod-icon {
    width: clamp(40px, 5vw, 52px); height: clamp(40px, 5vw, 52px);
    border-radius: clamp(10px, 1.2vw, 14px);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }
  .mod-card:hover .mod-icon { transform: scale(1.10) rotate(-4deg); }

  .mod-badge {
    display: inline-flex; align-items: center;
    padding: 3px 9px; border-radius: 999px;
    font-size: var(--t-xs); font-weight: 800;
    font-family: Outfit, sans-serif;
    letter-spacing: 0.06em;
    position: absolute; top: clamp(14px,1.8vw,20px); right: clamp(14px,1.8vw,20px);
  }

  .mod-name {
    font-family: Syne, sans-serif; font-weight: 800;
    font-size: clamp(15px, 1.6vw, 19px);
    margin: 0; color: var(--nl-ink); line-height: 1.2;
  }

  .mod-desc {
    font-size: var(--t-sm); line-height: 1.65;
    color: rgba(15,23,42,0.55); margin: 0; flex: 1;
  }

  .mod-stat {
    display: flex; align-items: center; gap: 10px;
    padding: clamp(8px,1vw,12px) clamp(10px,1.2vw,14px);
    background: rgba(11,92,171,0.04);
    border-radius: clamp(8px,1vw,12px);
    border: 1px solid rgba(11,92,171,0.08);
  }
  .mod-stat-val {
    font-weight: 900; font-size: clamp(14px,1.5vw,17px);
    font-family: Outfit, sans-serif;
    line-height: 1;
  }
  .mod-stat-lbl {
    font-size: var(--t-xs); color: rgba(15,23,42,0.38);
    font-family: Outfit, sans-serif; font-weight:600;
    letter-spacing: 0.02em;
  }

  .card-cta {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: var(--t-xs); font-weight: 800;
    border: 1.5px solid; border-radius: clamp(7px,0.9vw,10px);
    padding: clamp(6px,0.8vw,9px) clamp(10px,1.3vw,15px);
    text-decoration: none; margin-top: auto; width: fit-content;
    transition: all 0.2s ease;
    letter-spacing: 0.02em; font-family: Outfit, sans-serif;
  }
  .card-cta:hover { transform: translateX(3px); }
  .card-cta:hover .cta-arrow { transform: translateX(3px); }
  .cta-arrow { transition: transform 0.2s ease; }

  /* ══════════════════════════
     FEATURE STRIP
  ══════════════════════════ */
  .feature-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(160px, 18vw, 240px), 1fr));
    gap: clamp(10px, 1.5vw, 18px);
    animation: fadeInUp 0.6s 0.1s ease both;
  }
  .feature-item {
    background: rgba(255,255,255,0.80);
    border: 1.5px solid rgba(11,92,171,0.09);
    border-radius: clamp(12px, 1.5vw, 18px);
    padding: clamp(14px, 1.8vw, 22px) clamp(14px, 2vw, 22px);
    display: flex; flex-direction: column; gap: 10px;
    transition: all 0.25s ease;
    box-shadow: 0 2px 12px rgba(2,32,53,0.05);
  }
  .feature-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(2,32,53,0.09);
    border-color: rgba(11,92,171,0.20);
  }
  .feature-icon-wrap {
    width: clamp(34px, 4vw, 44px); height: clamp(34px, 4vw, 44px);
    border-radius: clamp(9px, 1vw, 12px);
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(16px, 2vw, 22px);
    flex-shrink: 0;
  }
  .feature-name {
    font-family: Outfit, sans-serif; font-weight: 800;
    font-size: var(--t-sm); color: var(--nl-ink); margin: 0;
  }
  .feature-desc {
    font-size: var(--t-xs); line-height: 1.6;
    color: rgba(15,23,42,0.50); margin: 0;
  }

  /* ══════════════════════════
     QUICK LINKS BAR
  ══════════════════════════ */
  .quick-link-bar {
    display: flex; gap: clamp(6px,0.9vw,12px); flex-wrap: wrap;
    padding: clamp(12px,1.5vw,18px) clamp(16px,2vw,24px);
    background: rgba(255,255,255,0.80);
    border: 1.5px solid rgba(11,92,171,0.10);
    border-radius: clamp(12px, 1.5vw, 18px);
    box-shadow: 0 2px 12px rgba(2,32,53,0.05);
    align-items: center;
    animation: fadeInUp 0.6s 0.2s ease both;
  }
  .quick-link-label {
    font-size: var(--t-xs); font-weight: 800;
    color: rgba(15,23,42,0.38); font-family: Outfit, sans-serif;
    letter-spacing: 0.1em; text-transform: uppercase;
    flex-shrink: 0; margin-right: 4px;
  }
  .quick-link {
    display: inline-flex; align-items: center; gap: 5px;
    padding: clamp(5px,0.6vw,7px) clamp(10px,1.2vw,14px);
    border-radius: 999px;
    font-size: var(--t-xs); font-weight: 700;
    text-decoration: none;
    transition: all 0.18s ease;
    font-family: Outfit, sans-serif; letter-spacing: 0.02em;
    border: 1.5px solid;
    white-space: nowrap;
  }

  /* ══════════════════════════
     BOTTOM BANNER
  ══════════════════════════ */
  .bottom-banner {
    background: linear-gradient(135deg, rgba(11,92,171,0.09) 0%, rgba(255,255,255,0.65) 50%, rgba(225,29,46,0.07) 100%);
    border: 1.5px solid rgba(11,92,171,0.16);
    border-radius: clamp(16px, 2vw, 24px);
    padding: clamp(24px, 3.5vw, 44px) clamp(22px, 3.5vw, 48px);
    display: flex; flex-wrap: wrap;
    align-items: center; justify-content: space-between;
    gap: clamp(16px, 2vw, 24px);
    position: relative; overflow: hidden;
    box-shadow: 0 8px 40px rgba(2,32,53,0.08);
    animation: fadeInUp 0.6s 0.1s ease both;
  }
  .bottom-banner::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background: var(--nl-grad);
  }

  /* ══════════════════════════
     INFO TICKER
  ══════════════════════════ */
  .info-ticker {
    background: linear-gradient(90deg, var(--nl-blue) 0%, #1474F3 100%);
    padding: clamp(6px,0.9vw,10px) clamp(14px,2vw,22px);
    display: flex; align-items: center; gap: clamp(10px,1.5vw,18px);
    border-radius: clamp(9px, 1.2vw, 14px);
    overflow: hidden;
    animation: fadeIn 0.5s ease both;
    flex-wrap: wrap;
  }
  .ticker-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #fff; opacity:0.6;
    animation: pulse 1.8s ease infinite;
    flex-shrink: 0;
  }
  .ticker-label {
    font-family: Outfit, sans-serif; font-weight: 800;
    font-size: var(--t-xs); color: rgba(255,255,255,0.70);
    letter-spacing: 0.1em; text-transform: uppercase;
    flex-shrink: 0;
  }
  .ticker-text {
    font-family: Outfit, sans-serif; font-size: var(--t-sm);
    font-weight: 600; color: white;
    display: flex; gap: clamp(12px, 2vw, 28px); flex-wrap: wrap;
  }
  .ticker-item { display:flex; align-items:center; gap:6px; }
  .ticker-sep { opacity: 0.3; }

  /* ══════════════════════════
     RESPONSIVE
  ══════════════════════════ */
  @media (min-width: 1440px) {
    .landing-content { max-width: 1360px; }
  }
  @media (min-width: 1600px) {
    .landing-content { max-width: 1500px; }
    .nl-hero-inner { padding: 56px 52px; }
  }

  @media (max-width: 920px) {
    .nl-hero-inner { flex-direction: column; text-align: center; }
    .nl-actions { justify-content: center; }
    .nl-divider { margin-left: auto; margin-right: auto; }
    .nl-sub { max-width: 100%; margin-left: auto; margin-right: auto; }
    .nl-typing { justify-content: center; }
    .nl-logo-col { flex-direction: row; justify-content: center; }
    .nl-eyebrow { margin-left: auto; margin-right: auto; }
  }

  @media (max-width: 640px) {
    .landing-main-pad { padding: 0 12px !important; }
    .nl-hero-wrap { border-radius: 18px; }
    .nl-hero-inner { padding: 20px 16px; gap: 14px; }
    .nl-logo { width: clamp(80px, 22vw, 120px); }
    .nl-actions { flex-direction: column; align-items: stretch; }
    .nl-actions a { width: 100%; text-align: center; justify-content: center; }
    .stat-bar { padding: 14px 14px; border-radius: 14px; }
    .stat-sep { display: none; }
    .mod-card { padding: 16px; border-radius: 16px; }
    .bottom-banner { padding: 20px 18px; border-radius: 18px; }
    .quick-link-bar { padding: 12px 14px; }
    .info-ticker { border-radius: 10px; }
  }

  @media (max-width: 480px) {
    .feature-strip { grid-template-columns: 1fr 1fr; }
    .stat-bar { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 360px) {
    .feature-strip { grid-template-columns: 1fr; }
    .stat-bar { grid-template-columns: 1fr 1fr; }
  }
`;

/* ─── Data ─── */
const MODULES = [
  {
    id: "assets",
    label: "Asset Master",
    color: "#1474F3",
    bgLight: "#eff6ff",
    desc: "Branch-wise inventory with real-time filtering by category, status, and device details across all locations.",
    stat: "2,000+", statLabel: "Assets tracked",
    to: "/branch-assets-report", cta: "Open Master Page",
    badgeText: "Live", badgeBg: "rgba(34,197,94,0.12)", badgeColor: "#15803d",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>,
  },
  {
    id: "branches",
    label: "Branches",
    color: "#10B981",
    bgLight: "#f0fdf4",
    desc: "Maintain branch master data, infrastructure records, and audit compliance across all 185+ locations.",
    stat: "185+", statLabel: "Branches managed",
    to: "/branches", cta: "View Branches",
    badgeText: null,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"/></svg>,
  },
  {
    id: "requests",
    label: "IT Asset Requests",
    color: "#F59E0B",
    bgLight: "#fffbeb",
    desc: "Submit, track, and approve IT service requests — from procurement to issue resolution.",
    stat: "98%", statLabel: "Resolution rate",
    to: "/requests", cta: "Manage Requests",
    badgeText: null,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"/></svg>,
  },
  {
    id: "support",
    label: "Help Desk",
    color: "#0d9488",
    bgLight: "#f0fdfa",
    managerOnly: true,
    desc: "Centralized support ticket management — reply, forward, escalate, and resolve user issues.",
    stat: "< 2h", statLabel: "Avg. response",
    to: "/support", cta: "Open Help Desk",
    badgeText: null,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/></svg>,
  },
  {
    id: "graph",
    label: "Analytics",
    color: "#7c3aed",
    bgLight: "#f5f3ff",
    managerOnly: true,
    desc: "Visual dashboards with asset distribution charts, trend analysis, and branch-by-branch comparisons.",
    stat: "Live", statLabel: "Data refresh",
    to: "/assetdashboard", cta: "View Dashboard",
    badgeText: "New", badgeBg: "rgba(124,58,237,0.12)", badgeColor: "#6d28d9",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>,
  },
  {
    id: "files",
    label: "File Library",
    color: "#0B5CAB",
    bgLight: "#eff6ff",
    adminOnly: true,
    desc: "Centralized document and file repository. Access policy documents, IT manuals, and compliance reports.",
    stat: "Secure", statLabel: "Document vault",
    to: "/file-library", cta: "Open Library",
    badgeText: null,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V10.5a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"/></svg>,
  },
];

const STATS = [
  { value: "2,000+", label: "Assets Tracked",    icon: "📦" },
  { value: "185+",   label: "Branch Locations",  icon: "🏢" },
  { value: "98%",    label: "Resolution Rate",   icon: "✅" },
  { value: "< 2h",   label: "Avg. Response",     icon: "⚡" },
  { value: "24/7",   label: "System Uptime",     icon: "🟢" },
];

const FEATURES = [
  { icon: "🔍", name: "Real-time Search", desc: "Filter assets by code, branch, user, or status instantly", color: "#1474F3", bg: "#eff6ff" },
  { icon: "📊", name: "Live Dashboard",   desc: "Charts and KPIs updated in real-time across all branches", color: "#7c3aed", bg: "#f5f3ff" },
  { icon: "🔄", name: "Asset Transfer",   desc: "Move assets between branches with full audit trail",      color: "#0d9488", bg: "#f0fdfa" },
  { icon: "📤", name: "Excel Export",     desc: "One-click export of filtered data to formatted Excel",    color: "#d97706", bg: "#fffbeb" },
  { icon: "🛡",  name: "Role-Based Access", desc: "Admin, Sub-Admin and User roles with granular controls", color: "#E11D2E", bg: "#fef2f2" },
  { icon: "📱", name: "Mobile Ready",    desc: "Fully responsive UI — works on tablet and mobile screens",  color: "#10B981", bg: "#f0fdf4" },
];

const QUICK_LINKS = [
  { label: "Assets",     to: "/branch-assets-report", color: "#1474F3",  bg: "#eff6ff",  border: "rgba(20,116,243,0.22)" },
  { label: "Branches",   to: "/branches",             color: "#10B981",  bg: "#f0fdf4",  border: "rgba(16,185,129,0.22)" },
  { label: "Requests",   to: "/requests",             color: "#F59E0B",  bg: "#fffbeb",  border: "rgba(245,158,11,0.22)" },
  { label: "Dashboard",  to: "/assetdashboard",       color: "#7c3aed",  bg: "#f5f3ff",  border: "rgba(124,58,237,0.22)" },
  { label: "Support",    to: "/support",              color: "#0d9488",  bg: "#f0fdfa",  border: "rgba(13,148,136,0.22)" },
  { label: "Files",      to: "/file-library",         color: "#0B5CAB",  bg: "#eff6ff",  border: "rgba(11,92,171,0.22)"  },
];

/* ─── Typing hook ─── */
function useTyping(lines) {
  const [display, setDisplay] = useState("");
  const [li, setLi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const cur = lines[li] || "";
    let t;
    if (!del && ci < cur.length)     t = setTimeout(() => { setDisplay(cur.slice(0, ci + 1)); setCi(ci + 1); }, 52);
    else if (!del)                   t = setTimeout(() => setDel(true), 1400);
    else if (del && ci > 0)          t = setTimeout(() => { setDisplay(cur.slice(0, ci - 1)); setCi(ci - 1); }, 24);
    else { setDel(false); setLi(l => (l + 1) % lines.length); }
    return () => clearTimeout(t);
  }, [ci, del, li, lines]);

  return display;
}

/* ─── Arrow SVG ─── */
const ArrowIcon = () => (
  <svg style={{width:13,height:13}} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
  </svg>
);

/* ─── Module Card ─── */
function ModuleCard({ mod, index, isManager }) {
  const [hovered, setHovered] = useState(false);
  const { color, bgLight, label, desc, stat, statLabel, to, cta, icon, badgeText, badgeBg, badgeColor } = mod;

  return (
    <div
      className="mod-card"
      style={{
        animationDelay: `${index * 85}ms`,
        "--card-accent": color,
        borderColor: hovered ? `${color}35` : "rgba(11,92,171,0.10)",
        boxShadow: hovered ? `0 22px 56px -10px ${color}22, 0 2px 16px rgba(2,32,53,0.06)` : "0 2px 16px rgba(2,32,53,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {badgeText && (
        <div className="mod-badge" style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}30` }}>
          {badgeText}
        </div>
      )}

      <div className="mod-icon" style={{ background: bgLight || `${color}12`, color }}>
        {icon}
      </div>

      <div>
        <h3 className="mod-name">{label}</h3>
      </div>

      <p className="mod-desc">{desc}</p>

      <div className="mod-stat">
        <div>
          <div className="mod-stat-val" style={{ color }}>{stat}</div>
          <div className="mod-stat-lbl">{statLabel}</div>
        </div>
      </div>

      <Link to={to} className="card-cta" style={{ borderColor: `${color}50`, color, background: hovered ? bgLight : "transparent" }}>
        {cta}
        <span className="cta-arrow"><ArrowIcon /></span>
      </Link>
    </div>
  );
}

/* ─── Main ─── */
export default function Landing() {
  const { user, isAdmin, isSubAdmin } = useAuth();
  const Admin = isAdmin;
  const isManager = isAdmin || isSubAdmin;
  const userName = user?.name || "there";

  const typingLines = isManager
    ? [`Welcome back, ${userName}`, "Monitor assets across all branches", "Approve requests in real-time", "Review analytics and trends"]
    : [`Hello, ${userName} 👋`, "View your branch assets easily", "Submit IT service requests", "Track progress and get support"];

  const typed = useTyping(typingLines);
    const visibleModules = MODULES.filter(
      (m) =>
        (!m.managerOnly || isManager) &&
        (!m.adminOnly || isAdmin)
    );
  /* Section gap */
  const sec = { marginTop: "clamp(28px, 4vw, 52px)" };

  return (
    <>
      <style>{FONTS}{LANDING_STYLES}</style>

      <div className="page-wrap" style={{
        minHeight: "100vh",
        background: "var(--nl-bg)",
        color: "var(--nl-ink)",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}>
        {/* Grid */}
        <div className="grid-bg" style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}/>

        {/* Ambient glows */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
          <div style={{ position:"absolute", top:"-12%", left:"50%", transform:"translateX(-50%)", width:"min(860px,90vw)", height:"min(540px,50vh)", background:"radial-gradient(ellipse, rgba(20,116,243,0.16) 0%, transparent 66%)" }}/>
          <div style={{ position:"absolute", bottom:"0%", right:"-10%", width:"min(700px,70vw)", height:"min(700px,70vw)", background:"radial-gradient(ellipse, rgba(225,29,46,0.10) 0%, transparent 68%)" }}/>
          <div style={{ position:"absolute", top:"45%", left:"-8%", width:"min(480px,50vw)", height:"min(480px,50vw)", background:"radial-gradient(ellipse, rgba(11,92,171,0.10) 0%, transparent 68%)" }}/>
        </div>

        <main
          className="landing-main-pad"
          style={{
            position:"relative", zIndex:10,
            maxWidth: "clamp(320px, 94vw, 1320px)",
            margin: "0 auto",
            padding: "0 clamp(12px, 2.5vw, 24px)",
          }}
        >
          {/* ── HERO ── */}
          <section style={{ paddingTop:"clamp(20px, 3.5vw, 42px)", paddingBottom:"clamp(16px, 2.5vw, 28px)" }}>
            <div className="nl-hero-wrap fade-up">
              <div className="nl-hero-inner">
                {/* Left: Text */}
                <div className="nl-hero-text">
                  <div className="nl-eyebrow fade-up">
                    <div className="nl-eyebrow-dot"/>
                    Nepal Life · IT Asset IMS · v2.5
                  </div>

                  <h1 className="nl-title fade-up-d1">
                    <span className="blue">NEPAL</span>
                    <span className="red">LIFE</span>{" "}
                    <span style={{ color:"rgba(15,23,42,0.65)", fontWeight:800 }}>Insurance Co. Ltd.</span>
                    <span className="nl-nepali">"किनकी जीवन अमूल्य छ"</span>
                  </h1>

                  <div className="nl-divider"/>

                  <p className="nl-sub fade-up-d2">
                    Centralized <strong>IT Asset Inventory Management System</strong> for all branches — track devices, manage requests, and monitor analytics from a single platform.
                  </p>

                  <div className="nl-actions fade-up-d3">
                    <Link to="/branch-assets-report" className="cta-primary">
                      View Asset Master<ArrowIcon/>
                    </Link>
                    {Admin && (
                    <Link to="/file-library" className="cta-secondary">
                      Open File Library
                    </Link>
                    )}
                    <Link to="/requests" className="cta-ghost">
                      {isManager ? "Review Requests" : "Submit a Request"}
                    </Link>
                  </div>

                  <div className="nl-typing fade-up-d4">
                    <span className="nl-typing-text">{typed}</span>
                    <span className="cursor-blink" style={{ color:"var(--nl-red)", lineHeight:1 }}>|</span>
                  </div>
                </div>

                {/* Right: Logo */}
                <div className="nl-logo-col">
                  <img src={NepalLifeLogo} alt="Nepal Life Insurance Co. Ltd." className="nl-logo"/>
                  <div className="nl-live-badge">
                    <span className="nl-live-dot"/>
                    System Online
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* ── STATS ── */}
          <section style={{ marginTop: 18, marginBottom: 56 }}>
            <div className="stat-bar">
              {STATS.map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: "clamp(1.4rem,3vw,2rem)",
                      fontWeight: 900,
                      background: "linear-gradient(135deg, var(--nl-blue) 0%, var(--nl-red) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(15,23,42,0.40)", marginTop: 5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── MODULES ── */}
          <section style={sec}>
            <div style={{ marginBottom:"clamp(18px,2.5vw,30px)", display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"clamp(10px,1.5vw,16px)" }}>
              <div>
                <div className="section-label">Quick Access</div>
                <h2 className="section-heading">System Modules</h2>
              </div>
              <p style={{ fontSize:"var(--t-sm)", color:"rgba(15,23,42,0.48)", maxWidth:380, lineHeight:1.65, margin:0 }}>
                Select a module to manage assets, branches, service requests, or analytics.
              </p>
            </div>

            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill, minmax(min(100%, clamp(240px, 28vw, 320px)), 1fr))",
              gap:"clamp(10px, 1.5vw, 18px)",
            }}>
              {visibleModules.map((mod, i) => (
                <ModuleCard key={mod.id} mod={mod} index={i} isManager={isManager}/>
              ))}
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section style={sec}>
            <div style={{ marginBottom:"clamp(16px,2.2vw,28px)" }}>
              <div className="section-label">Platform Capabilities</div>
              <h2 className="section-heading">Why AssetIMS?</h2>
            </div>
            <div className="feature-strip">
              {FEATURES.map((f, i) => (
                <div key={f.name} className="feature-item" style={{ animationDelay:`${i*60}ms` }}>
                  <div className="feature-icon-wrap" style={{ background:f.bg, color:f.color }}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="feature-name">{f.name}</p>
                    <p className="feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── BOTTOM CTA ── */}
          <section style={{ ...sec, paddingBottom:"clamp(36px, 5vw, 70px)" }}>
            <div className="bottom-banner">
              {/* Decorative glow */}
              <div style={{ position:"absolute", top:"-40%", right:"-4%", width:"min(280px,35vw)", height:"min(280px,35vw)", background:"radial-gradient(ellipse, rgba(11,92,171,0.16) 0%, transparent 70%)", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", bottom:"-30%", left:"10%", width:"min(200px,28vw)", height:"min(200px,28vw)", background:"radial-gradient(ellipse, rgba(225,29,46,0.10) 0%, transparent 70%)", pointerEvents:"none" }}/>

              <div style={{ position:"relative", zIndex:1, flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"clamp(6px,0.8vw,10px)" }}>
                  <div style={{ fontSize:"clamp(22px,3vw,32px)" }}>💬</div>
                  <h3 style={{ fontFamily:"Syne, sans-serif", fontSize:"clamp(16px, 2vw, 22px)", fontWeight:900, margin:0, color:"var(--nl-ink)" }}>
                    Need help with an IT issue?
                  </h3>
                </div>
                <p style={{ fontSize:"var(--t-sm)", color:"rgba(15,23,42,0.52)", margin:0, maxWidth:480 }}>
                  Submit a support ticket and our IT team will respond within 2 hours. Available for all branch staff across Nepal.
                </p>
                {/* Mini feature row */}
                <div style={{ display:"flex", gap:"clamp(10px,1.5vw,20px)", marginTop:"clamp(10px,1.3vw,16px)", flexWrap:"wrap" }}>
                  {["⚡ Fast response","🔒 Secure tickets","📊 Track status","✅ Resolved same-day"].map(item => (
                    <span key={item} style={{ fontSize:"var(--t-xs)", fontWeight:700, color:"rgba(15,23,42,0.55)", display:"flex", alignItems:"center", gap:5, fontFamily:"Outfit,sans-serif" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", gap:"clamp(8px,1vw,12px)", flexWrap:"wrap", position:"relative", zIndex:1, flexShrink:0 }}>
                <Link to="/support" className="cta-primary" style={{ boxShadow:"0 10px 30px rgba(20,116,243,0.28)" }}>
                  Open Help Desk <ArrowIcon/>
                </Link>
                <Link to="/requests" className="cta-ghost">
                  {isManager ? "Review All Requests" : "New Request"}
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer/>
    </>
  );
}