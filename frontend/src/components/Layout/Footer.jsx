
// src/components/Layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&family=Outfit:wght@500;600;700;800&display=swap');`;

const CSS = `
${FONTS}
.ft{
  font-family:'DM Sans',sans-serif;
  background:#060c18;
  border-top:1px solid rgba(255,255,255,0.07);
  position:relative; overflow:hidden;
  margin-top:auto;
}
.ft::before{
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(135deg,#0B5CAB 0%,#1474F3 55%,#E11D2E 100%);
}

/* Glow orbs */
.ft-g1{position:absolute;top:5%;left:3%;width:340px;height:340px;background:radial-gradient(ellipse,rgba(20,116,243,0.07) 0%,transparent 70%);pointer-events:none;}
.ft-g2{position:absolute;bottom:5%;right:3%;width:280px;height:280px;background:radial-gradient(ellipse,rgba(225,29,46,0.06) 0%,transparent 70%);pointer-events:none;}

.ft-body{
  max-width:1320px;margin:0 auto;
  padding:54px 28px 38px;
  display:grid;
  grid-template-columns:2fr 1fr 1fr 1.3fr;
  gap:48px;
  position:relative;z-index:1;
}

/* ── Brand ── */
.ft-brand-logo{display:flex;align-items:center;gap:11px;margin-bottom:16px;text-decoration:none;}
.ft-brand-mark{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#0B5CAB 0%,#1474F3 55%,#E11D2E 100%);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:900;font-size:14px;color:#fff;box-shadow:0 0 0 1.5px rgba(255,255,255,0.12);}
.ft-brand-name{font-family:'Syne',sans-serif;font-weight:900;font-size:17px;letter-spacing:-.02em;color:#fff;}
.ft-brand-name .r{color:#E11D2E;}
.ft-desc{font-size:13.5px;color:rgba(255,255,255,0.36);line-height:1.72;max-width:290px;margin-bottom:10px;}
.ft-tagline{font-size:11.5px;color:rgba(255,255,255,0.20);margin-bottom:20px;font-style:italic;}

/* Social buttons */
.ft-socials{display:flex;gap:8px;flex-wrap:wrap;}
.ft-soc{display:flex;align-items:center;gap:7px;padding:7px 13px;border-radius:10px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.50);border:1px solid rgba(255,255,255,0.09);background:rgba(255,255,255,0.04);text-decoration:none;font-family:'Outfit',sans-serif;transition:all .18s;cursor:pointer;}
.ft-soc:hover{color:#fff;background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.18);transform:translateY(-2px);}

/* ── Column headings ── */
.ft-col-title{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,0.26);margin-bottom:18px;display:flex;align-items:center;gap:8px;font-family:'Outfit',sans-serif;}
.ft-col-title::before{content:'';width:18px;height:2px;border-radius:99px;background:linear-gradient(90deg,#0B5CAB,#E11D2E);display:inline-block;}

/* ── Links ── */
.ft-lnk{display:flex;align-items:center;gap:8px;padding:7px 0;font-size:13.5px;font-weight:500;color:rgba(255,255,255,0.44);text-decoration:none;transition:color .16s,gap .16s;border:none;background:none;cursor:pointer;font-family:'DM Sans',sans-serif;width:fit-content;}
.ft-lnk:hover{color:#fff;gap:12px;}
.ft-lnk svg{opacity:.52;transition:opacity .16s;flex-shrink:0;}
.ft-lnk:hover svg{opacity:1;}

/* ── Contact items ── */
.ft-contact-item{display:flex;align-items:flex-start;gap:10px;padding:6px 0;}
.ft-contact-ico{opacity:.40;margin-top:1px;flex-shrink:0;}
.ft-contact-txt{font-size:12.5px;color:rgba(255,255,255,0.38);line-height:1.6;}

/* ── Status panel ── */
.ft-status{padding:16px 18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;margin-bottom:14px;}
.ft-status-title{font-size:11px;font-weight:800;color:rgba(255,255,255,0.26);letter-spacing:.12em;text-transform:uppercase;font-family:'Outfit',sans-serif;margin-bottom:12px;}
.ft-status-row{display:flex;align-items:center;justify-content:space-between;padding:5px 0;}
.ft-status-lbl{font-size:12px;color:rgba(255,255,255,0.42);}
.ft-status-pill{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;font-family:'Outfit',sans-serif;padding:3px 9px;border-radius:999px;background:rgba(34,197,94,0.12);color:#22c55e;border:1px solid rgba(34,197,94,0.22);}
@keyframes ftPulse{0%,100%{opacity:1}50%{opacity:.35}}
.ft-sdot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:ftPulse 2s ease infinite;}

/* ── Bottom bar ── */
.ft-bottom-wrap{border-top:1px solid rgba(255,255,255,0.06);}
.ft-bottom{max-width:1320px;margin:0 auto;padding:18px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:relative;z-index:1;}
.ft-copy{font-size:12px;color:rgba(255,255,255,0.24);font-family:'Outfit',sans-serif;}
.ft-copy .r{color:#E11D2E;}
.ft-badges{display:flex;align-items:center;gap:8px;}
.ft-badge{font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;padding:4px 10px;border-radius:7px;font-family:'Outfit',sans-serif;}
.ft-badge-blue{background:rgba(20,116,243,0.13);color:#60a5fa;border:1px solid rgba(20,116,243,0.22);}
.ft-badge-green{background:rgba(34,197,94,0.10);color:#4ade80;border:1px solid rgba(34,197,94,0.20);}

@media(max-width:900px){
  .ft-body{grid-template-columns:1fr 1fr;gap:32px;}
}
@media(max-width:560px){
  .ft-body{grid-template-columns:1fr;gap:28px;padding:36px 18px 28px;}
  .ft-bottom{padding:14px 18px;}
}
`;

/* ─────────────────────────────────────────────────────────────
   ICON
───────────────────────────────────────────────────────────── */
function Ic({ d, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const D = {
  home:      "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  branch:    "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets:    "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  requests:  "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  graph:     "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  help:      "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  users:     "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  folder:    "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V10.5a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z",
  phone:     "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z",
  email:     "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
  location:  "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
  clock:     "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  arrow:     "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3",
};

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const QUICK_LINKS = [
  { label: "Home",         to: "/",                     icon: D.home     },
  { label: "Asset Master", to: "/branch-assets-report", icon: D.assets   },
  { label: "Branches",     to: "/branches",             icon: D.branch   },
  { label: "Requests",     to: "/requests",             icon: D.requests },
  { label: "Analytics",    to: "/assetdashboard",       icon: D.graph    },
  { label: "Help Desk",    to: "/support",              icon: D.help     },
  { label: "File Library", to: "/file-library",         icon: D.folder   },
  { label: "Users",        to: "/admin/users",          icon: D.users    },
];

const SOCIALS = [
  { label: "Facebook",  href: "https://www.facebook.com/Nepallife.Insurance",        icon: "ⓕ" },
  { label: "LinkedIn",  href: "https://np.linkedin.com/company/nepallife-insurance", icon: "ⓛ" },
  { label: "Instagram", href: "https://www.instagram.com/nepallife.insurance",       icon: "ⓘ" },
  { label: "Twitter",   href: "https://twitter.com",                                 icon: "𝕏"  },
];

const STATUS_ITEMS = [
  "Asset IMS",
  "File Library",
  "Help Desk",
  "Notifications",
];

/* ─────────────────────────────────────────────────────────────
   FOOTER  (default export)
───────────────────────────────────────────────────────────── */
export default function Footer() {
  const { isAdmin, isSubAdmin } = useAuth();
  const canRequests = isAdmin || isSubAdmin;

  // Filter Users link for non-admins
  const links = QUICK_LINKS.filter(l => {
    if (l.to === "/admin/users") return isAdmin;
    if (l.to === "/requests") return canRequests;
    return true;
  });

  return (
    <>
      <style>{CSS}</style>
      <footer className="ft">
        {/* Ambient glows */}
        <div className="ft-g1" />
        <div className="ft-g2" />

        <div className="ft-body">

          {/* ── Col 1: Brand ── */}
          <div>
            <Link to="/" className="ft-brand-logo">
              <div className="ft-brand-mark">NL</div>
              <span className="ft-brand-name">Asset<span className="r">IMS</span></span>
            </Link>
            <p className="ft-desc">
              Centralized IT Asset Inventory Management System for all Nepal Life Insurance branches —
              track devices, manage requests, and monitor analytics from one platform.
            </p>
            <p className="ft-tagline">"किनकी जीवन अमूल्य छ"</p>

            <div className="ft-socials">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="ft-soc">
                  <span style={{ fontSize: 13 }}>{s.icon}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div>
            <div className="ft-col-title">Quick Links</div>
            {links.map(l => (
              <Link key={l.to} to={l.to} className="ft-lnk">
                <Ic d={l.icon} size={13} />
                {l.label}
              </Link>
            ))}
          </div>

          {/* ── Col 3: Contact ── */}
          <div>
            <div className="ft-col-title">Contact</div>

            <div className="ft-contact-item">
              <span className="ft-contact-ico"><Ic d={D.phone} size={13} /></span>
              <span className="ft-contact-txt">+977-01-XXXXXXX<br />+977-01-XXXXXXX</span>
            </div>
            <div className="ft-contact-item">
              <span className="ft-contact-ico"><Ic d={D.email} size={13} /></span>
              <span className="ft-contact-txt">itsupport@nepallife.com.np</span>
            </div>
            <div className="ft-contact-item">
              <span className="ft-contact-ico"><Ic d={D.location} size={13} /></span>
              <span className="ft-contact-txt"> Kamaldi, Kathmandu</span>
            </div>
            <div style={{ marginTop: 22 }}>
              <div className="ft-col-title">Office Hours</div>
              <div className="ft-contact-item">
                <span className="ft-contact-ico"><Ic d={D.clock} size={13} /></span>
                <span className="ft-contact-txt">
                  Sunday – Friday<br />
                  <span style={{ color: "rgba(255,255,255,0.54)", fontWeight: 600 }}>10:00 AM – 5:00 PM NST</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── Col 4: System Status ── */}
          <div>
            <div className="ft-col-title">System Status</div>

            <div className="ft-status">
              <div className="ft-status-title">Live Status</div>
              {STATUS_ITEMS.map(s => (
                <div className="ft-status-row" key={s}>
                  <span className="ft-status-lbl">{s}</span>
                  <div className="ft-status-pill">
                    <div className="ft-sdot" />
                    Operational
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.20)", lineHeight: 1.7, fontFamily: "Outfit" }}>
              <span style={{ color: "#4ade80", fontWeight: 700 }}>●</span> All systems operational<br />
              Last checked: <span style={{ color: "rgba(255,255,255,0.38)" }}>Just now</span>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="ft-bottom-wrap">
          <div className="ft-bottom">
            <div className="ft-copy">
              © {new Date().getFullYear()} Nepal Life Insurance Co. Ltd. — Project <span className="r">IMS</span> · All rights reserved.
            </div>
            <div className="ft-badges">
              <span className="ft-badge ft-badge-blue">NLIC</span>
              <span className="ft-badge ft-badge-green">99.9% Uptime</span>
              <span className="ft-badge ft-badge-blue">Secured</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}