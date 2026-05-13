import { NavLink, useLocation, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const NL_BLUE = "#0B5CAB";
const NL_RED = "#C8202E";

const DEFAULT_ICONS = {
  dashboard: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  admin: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  department: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  document: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  request: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  notice: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  report: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  default: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
};

function resolveIcon(item) {
  if (item.icon) return item.icon;
  const key = Object.keys(DEFAULT_ICONS).find(
    (k) => item.path?.toLowerCase().includes(k) || item.label?.toLowerCase().includes(k)
  );
  return DEFAULT_ICONS[key] || DEFAULT_ICONS.default;
}

const HamburgerIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    {open ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      <>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    )}
  </svg>
);

const ChevronIcon = ({ collapsed = false }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    style={{ transform: collapsed ? "none" :"rotate(180deg)" }}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const SplitSidebarLayout = ({
  title,
  subtitle,
  badge,
  children,
  navItems = [],
  user,
  brand = { initials: "NL", name: "Nepal Life", subtext: "Portal" },
}) => {
  const location = useLocation();

  const getInitialMobile = () =>
    typeof window !== "undefined" && window.innerWidth <= 768;

  const [isMobile, setIsMobile] = useState(getInitialMobile);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(true);
    };

    const onKey = (e) => {
      if (e.key === "Escape" && isMobile) setMenuOpen(false);
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, [isMobile]);

  const isNavActive = useMemo(() => {
    return (path) => {
      if (path === "/") return location.pathname === "/";
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };
  }, [location.pathname]);

  const userRole = user?.role?.name || user?.role || "User";
  const userName = user?.full_name || user?.name || "Authenticated User";
  const userDepartment = user?.department?.name || user?.departmentName || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
          min-height: 100%;
          background: #eef4fb;
        }

        .sl-shell {
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background:
            radial-gradient(circle at 0% 0%, rgba(20,116,243,0.06), transparent 28%),
            radial-gradient(circle at 100% 0%, rgba(11,92,171,0.05), transparent 32%),
            linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%);
        }

        .sl-root {
          --sb-open: 274px;
          --sb-closed: 78px;
          --sb-bg: #0b1120;
          --sb-bg2: #0f1829;
          --sb-border: rgba(255,255,255,0.07);
          --sb-muted: #64748b;
          --sb-soft: #94a3b8;
          --sb-text: #e2e8f0;
          --accent: #1474F3;
          --accent2: #60a5fa;
          --nav-hover: rgba(255,255,255,0.06);
          --nav-active: linear-gradient(135deg, rgba(20,116,243,0.22), rgba(96,165,250,0.13));
          --nav-active-bd: rgba(96,165,250,0.30);

          display: flex;
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          align-items: stretch;
          font-family: 'Outfit', system-ui, sans-serif;
        }

        .sl-sidebar-wrap {
          position: relative;
          flex-shrink: 0;
          display: flex;
        }

        .sl-sidebar {
          width: var(--sb-closed);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)),
            linear-gradient(180deg, var(--sb-bg) 0%, var(--sb-bg2) 100%);
          border-right: 1px solid var(--sb-border);
          box-shadow: 10px 0 34px rgba(2,6,23,0.24);
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: visible;
          z-index: 30;
        }

        .sl-sidebar.open {
          width: var(--sb-open);
        }

        .sl-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 12px 10px 12px;
          overflow: hidden;
        }

        .sl-head {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 56px;
          margin: 30px 0px;
          padding: 4px 2px 8px;
        }

        .sl-logo {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, #fafafa, #9dd6fc);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          font-family: Syne, sans-serif;
          box-shadow: 0 10px 24px rgba(20,116,243,0.28);
          user-select: none;
        }

        .sl-brand {
          min-width: 0;
          overflow: hidden;
          opacity: 0;
          width: 0;
          transition: opacity 0.2s ease 0.05s, width 0.25s ease;
          white-space: nowrap;
        }

        .sl-sidebar.open .sl-brand {
          opacity: 1;
          width: auto;
        }

        .sl-brand-name {
          color: #fff;
          font-size: 14.5px;
          font-weight: 800;
          font-family: Syne, sans-serif;
          line-height: 1.1;
        }

        .sl-brand-sub {
          color: var(--sb-muted);
          font-size: 10.5px;
          margin-top: 3px;
          font-weight: 500;
        }

        .sl-toggle {
          width: 34px;
          height: 34px;
          min-width: 34px;
          margin-left: auto;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sl-toggle:hover {
          background: rgba(255,255,255,0.10);
        }

        .sl-section-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--sb-muted);
          padding: 0 10px;
          margin-bottom: 6px;
          overflow: hidden;
          white-space: nowrap;
          opacity: 0;
          height: 0;
          transition: opacity 0.2s ease, height 0.2s ease;
        }

        .sl-sidebar.open .sl-section-label {
          opacity: 1;
          height: 18px;
        }

        .sl-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
          min-height: 0;
          margin-top: 2px;
        }

        .sl-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 48px;
          padding: 0 11px;
          border-radius: 15px;
          color: var(--sb-muted);
          text-decoration: none;
          border: 1px solid transparent;
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
          overflow: visible;
          white-space: nowrap;
        }

        .sl-nav-link:hover {
          background: var(--nav-hover);
          color: var(--sb-text);
          border-color: rgba(255,255,255,0.05);
          transform: translateX(2px);
        }

        .sl-nav-link.active {
          background: var(--nav-active);
          color: #fff;
          border-color: var(--nav-active-bd);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 22px rgba(20,116,243,0.12);
        }

        .sl-nav-link.active::before {
          content: "";
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 22px;
          background: linear-gradient(180deg, #1474F3, #60a5fa);
          border-radius: 0 2px 2px 0;
        }

        .sl-nav-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: var(--sb-muted);
          transition: all .18s ease;
        }

        .sl-nav-link:hover .sl-nav-icon {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.10);
          color: var(--sb-text);
        }

        .sl-nav-link.active .sl-nav-icon {
          background: rgba(20,116,243,0.22);
          border-color: rgba(96,165,250,0.28);
          color: #60a5fa;
          box-shadow: 0 0 14px rgba(20,116,243,0.18);
        }

        .sl-nav-label {
          font-size: 13px;
          font-weight: 700;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sl-sidebar:not(.open) .sl-nav-label,
        .sl-sidebar:not(.open) .sl-nav-chevron {
          opacity: 0;
          width: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .sl-sidebar:not(.open) .sl-nav-link {
          padding: 0;
          justify-content: center;
        }

        .sl-sidebar:not(.open) .sl-nav-link.active {
          background: transparent;
          border-color: transparent;
          box-shadow: none;
          transform: none;
        }

        .sl-sidebar:not(.open) .sl-nav-link.active::before {
          display: none;
        }

        .sl-sidebar:not(.open) .sl-nav-link.active .sl-nav-icon {
          background: rgba(20,116,243,0.14);
          border-color: rgba(96,165,250,0.34);
          color: #60a5fa;
          box-shadow:
            0 0 0 1px rgba(96,165,250,0.10),
            0 0 18px rgba(20,116,243,0.28),
            0 8px 18px rgba(20,116,243,0.16);
        }

        .sl-tooltip {
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: #1e2a45;
          color: #e2e8f0;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 11px;
          border-radius: 9px;
          white-space: nowrap;
          pointer-events: none;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 8px 24px rgba(2,6,23,0.40);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.16s ease, visibility 0.16s ease;
          z-index: 200;
        }

        .sl-sidebar:not(.open) .sl-nav-link:hover .sl-tooltip {
          opacity: 1;
          visibility: visible;
        }

        .sl-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0));
          margin: 12px 4px;
        }

        .sl-user-card {
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
        }

        .sl-user-inner {
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sl-user-avatar {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0B5CAB, #1474F3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Syne, sans-serif;
          font-weight: 900;
          color: #fff;
          font-size: 12px;
          box-shadow: 0 4px 12px rgba(20,116,243,0.24);
        }

        .sl-user-info {
          min-width: 0;
          opacity: 0;
          width: 0;
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.2s ease, width 0.22s ease;
        }

        .sl-sidebar.open .sl-user-info {
          opacity: 1;
          width: auto;
        }

        .sl-user-name {
          color: #fff;
          font-size: 12.5px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sl-user-role {
          color: var(--sb-muted);
          font-size: 10.5px;
          margin-top: 2px;
          text-transform: capitalize;
          font-weight: 500;
        }

        .sl-user-dept {
          color: var(--sb-soft);
          font-size: 10px;
          margin-top: 1px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sl-online-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34,197,94,0.6);
          margin-left: auto;
        }

        .sl-collapse-rail {
          position: absolute;
          top: 18px;
          right: -18px;
          z-index: 60;
        }

        .sl-float-btn {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: #1474F3;
          border: 3px solid #eef4fb;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(20,116,243,0.28);
        }

        .sl-float-btn:hover {
          transform: scale(1.06);
          background: #0B5CAB;
        }

        .sl-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(2,6,23,0.55);
          backdrop-filter: blur(3px);
          z-index: 25;
        }

        .sl-mobile-fab {
          display: none;
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 1100;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: rgba(11,17,32,0.92);
          border: 1px solid rgba(255,255,255,0.10);
          color: #fff;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(2,6,23,0.36);
          align-items: center;
          justify-content: center;
        }

        .sl-main {
          flex: 1;
          min-width: 0;
          min-height: 100vh;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          background: transparent;
        }

        .sl-page-header {
          margin: 0;
          padding: 22px 22px 14px;
        }

        .sl-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(20,116,243,0.09);
          color: #1474F3;
          border: 1px solid rgba(20,116,243,0.14);
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .sl-page-header h1 {
          font-family: Syne, sans-serif;
          font-size: clamp(1.7rem, 2.8vw, 2.4rem);
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 8px;
          line-height: 1.08;
        }

        .sl-page-header p {
          color: #64748b;
          font-size: 14.5px;
          line-height: 1.7;
          max-width: 720px;
          margin: 0;
        }

        .sl-content {
          flex: 1;
          min-width: 0;
          min-height: 0;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }

        .sl-content > * {
          margin-top: 0 !important;
        }

        .sl-content-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 24px;
          box-shadow: 0 10px 28px rgba(15,23,42,0.06);
          overflow: hidden;
          padding: 2px;
          margin: 0 16px 16px;
        }

        .sl-content-card-body {
          flex: 1;
          min-height: 0;
          padding: 18px;
        }

        @media (max-width: 768px) {
          .sl-root {
            display: block;
            position: relative;
            min-height: 100vh;
          }

          .sl-overlay {
            display: block;
          }

          .sl-sidebar-wrap {
            position: static;
          }

          .sl-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            height: 100vh;
            width: 280px !important;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          }

          .sl-sidebar.open {
            transform: translateX(0) !important;
          }

          .sl-sidebar .sl-brand,
          .sl-sidebar .sl-user-info,
          .sl-sidebar .sl-nav-label,
          .sl-sidebar .sl-nav-chevron,
          .sl-sidebar .sl-section-label {
            opacity: 1 !important;
            width: auto !important;
            height: auto !important;
            pointer-events: auto !important;
          }

          .sl-sidebar .sl-nav-link {
            padding: 0 11px !important;
            justify-content: flex-start !important;
          }

          .sl-collapse-rail,
          .sl-tooltip {
            display: none !important;
          }

          .sl-mobile-fab {
            display: inline-flex;
          }

          .sl-main {
            min-height: 100vh;
          }

          .sl-page-header {
            padding: 68px 14px 12px;
          }

          .sl-content-card {
            margin: 0 10px 10px;
            border-radius: 18px;
          }

          .sl-content-card-body {
            padding: 14px;
          }
        }

        @media (max-width: 480px) {
          .sl-page-header {
            padding: 66px 10px 10px;
          }

          .sl-sidebar {
            width: min(86vw, 300px) !important;
          }

          .sl-content-card {
            margin: 0 8px 8px;
            border-radius: 16px;
          }

          .sl-content-card-body {
            padding: 12px;
          }
        }
      `}</style>

      <div className="sl-shell">
        <div className="sl-root">
          {isMobile && menuOpen && (
            <div className="sl-overlay" onClick={() => setMenuOpen(false)} />
          )}

          {isMobile && (
            <button
              className="sl-mobile-fab"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          )}

          <div className="sl-sidebar-wrap">
            <aside className={`sl-sidebar ${menuOpen ? "open" : ""}`}>
              {!isMobile && (
                <div className="sl-collapse-rail">
                  <button
                    className="sl-float-btn"
                    onClick={() => setMenuOpen((p) => !p)}
                    aria-label={menuOpen ? "Collapse sidebar" : "Expand sidebar"}
                    title={menuOpen ? "Collapse sidebar" : "Expand sidebar"}
                  >
                    <ChevronIcon collapsed={!menuOpen} />
                  </button>
                </div>
              )}

              <div className="sl-inner">
                <div className="sl-head">
                  <Link to="/" onClick={() => isMobile && setMenuOpen(false)}>
                    <div className="sl-logo">
                      <img
                        src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN"
                        alt="Logo"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          objectFit: "cover",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                        }}
                      />
                    </div>
                  </Link>

                  <div className="sl-brand">
                    <div className="sl-brand-name">
                      <div className="hidden sm:block">
                        <p className="text-[13px] font-black tracking-tight leading-none">
                          <span style={{ color: NL_BLUE }}>NEPAL</span>
                          <span style={{ color: NL_RED }}>LIFE</span>
                        </p>
                        <p className="text-[9px] font-semibold text-slate-400 tracking-widest uppercase leading-none mt-0.5">
                          Insurance Co. Ltd.
                        </p>
                      </div>
                    </div>
                    <div className="sl-brand-sub">{brand.subtext}</div>
                  </div>

                  {isMobile && (
                    <button
                      className="sl-toggle"
                      onClick={() => setMenuOpen(false)}
                      aria-label="Close sidebar"
                    >
                      <HamburgerIcon open />
                    </button>
                  )}
                </div>

                <div className="sl-section-label">Navigation</div>

                <nav className="sl-nav">
                  {navItems.map((item) => {
                    const active = isNavActive(item.path);
                    const icon = resolveIcon(item);

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/"}
                        className={`sl-nav-link${active ? " active" : ""}`}
                        onClick={() => isMobile && setMenuOpen(false)}
                      >
                        <span className="sl-nav-icon">{icon}</span>
                        <span className="sl-nav-label">{item.label}</span>
                        {active && (
                          <span className="sl-nav-chevron">
                            <ChevronIcon />
                          </span>
                        )}
                        <span className="sl-tooltip">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                {user && (
                  <>
                    <div className="sl-divider" />
                    <div className="sl-section-label">Signed in as</div>
                    <div className="sl-user-card">
                      <div className="sl-user-inner">
                        <div className="sl-user-avatar">{userInitials}</div>
                        <div className="sl-user-info">
                          <div className="sl-user-name">{userName}</div>
                          <div className="sl-user-role">
                            {String(userRole).replace("_", " ")}
                          </div>
                          {userDepartment && (
                            <div className="sl-user-dept">{userDepartment}</div>
                          )}
                        </div>
                        <div className="sl-online-dot" title="Online" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>

          <main className="sl-main">
            {(title || subtitle || badge) && (
              <div className="sl-page-header">
                {badge && <div className="sl-badge">{badge}</div>}
                {title && <h1>{title}</h1>}
                {subtitle && <p>{subtitle}</p>}
              </div>
            )}

            <div className="sl-content">
              <div className="sl-content-card">
                <div className="sl-content-card-body">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SplitSidebarLayout;