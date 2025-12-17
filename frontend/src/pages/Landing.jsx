// src/pages/Landing.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Layout/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import "../styles/Pages.css";

export default function Landing() {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const isSubAdmin = user?.isSubAdmin;
  const isManager = isAdmin || isSubAdmin;

  const userName = user?.name || "User";

  /* ================= TYPING GREETING ================= */
  const adminLines = [
    `Welcome ${userName}`,
    "Monitor and manage IT assets across all branches",
    "Approve requests and maintain system integrity",
    "Analyze reports and ensure operational efficiency"
  ];

  const userLines = [
    `Welcome ${userName}`,
    "View assets assigned to your branch",
    "Submit IT and asset-related requests",
    "Track status and get support easily"
  ];

  const lines = isManager ? adminLines : userLines;

  const [displayText, setDisplayText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentLine = lines[lineIndex];
    let timeout;

    if (!isDeleting && charIndex < currentLine.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayText(currentLine.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 80);
    } else if (!isDeleting && charIndex === currentLine.length) {
      // Pause after typing
      timeout = setTimeout(() => setIsDeleting(true), 1200);
    } else if (isDeleting && charIndex > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayText(currentLine.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 40);
    } else if (isDeleting && charIndex === 0) {
      // Move to next line
      setIsDeleting(false);
      setLineIndex((prev) => (prev + 1) % lines.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, lineIndex, lines]);

  return (
    <>
      <div className="header-spacer">
        <main className="landing-page">

          {/* ================= GREETING ================= */}
          <section className="greeting-section">
            <h2>IT Asset Inventory System</h2>
            <p className="typing-text">{displayText}</p>
          </section>

          {/* ================= MAIN FEATURES ================= */}
          <section className="features-section">
            <h3>What would you like to work on today?</h3>
            <p style={{ fontSize: "1.1rem", textAlign: "center" }}>
              Choose a module to view, update, or analyze data.
            </p>

            <div className="features-list">

              {/* Assets */}
              <div className="feature-box">
                <div className="feature-image">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/11452/11452476.png"
                    alt="Assets"
                  />
                </div>
                <div className="feature-content">
                  <h4>Branch Assets</h4>
                  <p>
                    {isManager
                      ? "View and manage all IT assets across branches with detailed filtering and lifecycle tracking."
                      : "View assets assigned to your branch or to you, including configuration and warranty details."}
                  </p>
                  <Link to="/assets" className="feature-link">
                    Go to Assets
                  </Link>
                </div>
              </div>

              {/* Branches */}
              <div className="feature-box">
                <div className="feature-image">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2620/2620434.png"
                    alt="Branches"
                  />
                </div>
                <div className="feature-content">
                  <h4>Branches & Infrastructure</h4>
                  <p>
                    {isManager
                      ? "Maintain branch master data and infrastructure including desktops, printers, CCTV, and network devices."
                      : "View branch details, service station mapping, and IT contacts."}
                  </p>
                  <Link to="/branches" className="feature-link">
                    Manage Branches
                  </Link>
                </div>
              </div>

              {/* Requests */}
              <div className="feature-box">
                <div className="feature-image">
                  <img
                    src={
                      isAdmin
                        ? "https://cdn-icons-png.flaticon.com/512/3500/3500705.png"
                        : "https://cdn-icons-png.flaticon.com/512/1077/1077976.png"
                    }
                    alt="Requests"
                  />
                </div>
                <div className="feature-content">
                  <h4>{isAdmin ? "Requests & Approvals" : "IT Requests"}</h4>
                  <p>
                    {isAdmin
                      ? "Approve, monitor, and close IT and asset-related requests with a complete audit trail."
                      : "Submit and track asset, repair, or configuration requests easily."}
                  </p>
                  <Link
                    to={isAdmin ? "/AdminRequests" : "/Request"}
                    className="feature-link"
                  >
                    {isAdmin ? "Open Dashboard" : "Submit Request"}
                  </Link>
                </div>
              </div>

              {/* Reports */}
              {isManager && (
                <div className="feature-box">
                  <div className="feature-image">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                      alt="Reports"
                    />
                  </div>
                  <div className="feature-content">
                    <h4>Reports & Admin Tools</h4>
                    <p>
                      Analyze assets by branch, condition, and status. Maintain
                      master data and audit trails.
                    </p>
                    <Link to="/reports" className="feature-link">
                      View Reports
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="footer-spacer" />
        </main>
      </div>

      <Footer />
    </>
  );
}
  