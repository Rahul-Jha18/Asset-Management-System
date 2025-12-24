import React, { useEffect, useState } from "react";
import "../styles/supprt.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SupportPage() {
  const { user } = useAuth();

  const isStaff =
    user?.role === "admin" || user?.role === "subadmin" || user?.role === "support";

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ ticket panel
  const [showTickets, setShowTickets] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(false);

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadTickets = async () => {
    try {
      setTicketLoading(true);

      // ✅ user sees only their tickets
      const url = isStaff ? "/api/support" : "/api/support/my";
      const res = await api.get(url);

      setTickets(res.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load tickets");
    } finally {
      setTicketLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/support/${id}`, { status });
      loadTickets();
    } catch (err) {
      alert(err?.response?.data?.message || "Status update failed");
    }
  };

  useEffect(() => {
    if (showTickets) loadTickets();
  }, [showTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      setLoading(true);
      await api.post("/api/support", form);

      setSuccessMsg("✅ Thanks! Your message has been submitted.");
      setForm({ ...form, subject: "", message: "" });

      // if tickets panel is open, refresh it
      if (showTickets) loadTickets();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "❌ Submit failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support">
      {/* Hero */}
      <header className="support__hero">
        <div className="support__heroInner">
          <div className="support__heroText">
            <span className="support__badge">Support Center</span>
            <h1 className="support__title">How can we help you today?</h1>
            <p className="support__subtitle">
              Find quick answers in our FAQs or send us a message. We’re here to help.
            </p>
          </div>

          <div className="support__heroPanel" aria-hidden="true">
            <div className="support__panelCard">
              <p className="support__panelTitle">Need faster help?</p>
              <p className="support__panelText">
                Include screenshots, your device/browser, and steps to reproduce the issue.
              </p>
              <div className="support__panelList">
                <span>✅ Clear subject</span>
                <span>✅ Exact error message</span>
                <span>✅ When it happened</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="support__container">
        {/* ✅ TICKETS PANEL (both user + admin) */}
        {showTickets && (
          <section className="support__section support__card" style={{ marginBottom: 18 }}>
            <div className="support__sectionHeader">
              <h2 className="support__h2">
                {isStaff ? "All Support Tickets" : "My Support Tickets"}
              </h2>
              <p className="support__desc">
                {isStaff ? "Manage tickets and update status." : "View your submitted requests."}
              </p>
            </div>

            {ticketLoading ? (
              <p>Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p>No tickets found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="support__table">
                <thead>
                    <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Description</th>
                    <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {tickets.map((t) => (
                    <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.name}</td>
                        <td>{t.email}</td>
                        <td className="truncate">{t.subject}</td>

                        {/* ✅ SHORT DESCRIPTION */}
                        <td className="truncate">
                        {t.message}
                        </td>

                        {/* ✅ SHORT STATUS */}
                        <td className="status-cell">
                        {isStaff ? (
                            <select
                            value={t.status}
                            onChange={(e) => updateStatus(t.id, e.target.value)}
                            >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Prog</option>
                            <option value="Resolved">Resolved</option>
                            </select>
                        ) : (
                            <span className="truncate">{t.status}</span>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>

              </div>
            )}
          </section>
        )}

        <div className="support__grid">
          {/* FAQ */}
          <section className="support__section">
            <div className="support__sectionHeader">
              <h2 className="support__h2">Frequently Asked Questions</h2>
              <p className="support__desc">Click a question to view the answer.</p>
            </div>

            <div className="support__faq">
              {[
                {
                  q: "How do I reset my password?",
                  a: "Go to the login page and click 'Forgot Password'. You’ll receive a reset link in your email. Check spam/junk if you don’t see it.",
                },
                {
                  q: "How do I contact support?",
                  a: "You can email us at support@example.com or use the contact form on this page.",
                },
                {
                  q: "What information should I include?",
                  a: "Include your account email, device/browser details, steps to reproduce the issue, and screenshots if possible.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`support__faqItem ${openFaq === index ? "active" : ""}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className="support__faqQuestion">
                    <h3 className="support__h3">{item.q}</h3>
                    <span className="support__faqIcon">{openFaq === index ? "v" : ">"}</span>
                  </div>
                  {openFaq === index && <p className="support__faqAnswer">{item.a}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <aside className="support__section support__card">
            <div className="support__sectionHeader">
              <div style={{ marginTop: 14, 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px' }}>
              <h2 className="support__h2">Contact Support</h2>
              <button
                type="button"
                className="support__button"
                onClick={() => setShowTickets((p) => !p)}
              >
                {showTickets ? "Hide" : "View"}
              </button>
              
            </div>
              <p className="support__desc">
                Send us a message and we’ll get back to you as soon as possible.
              </p>
            </div>

            {successMsg && <div className="support__alert success">{successMsg}</div>}
            {errorMsg && <div className="support__alert error">{errorMsg}</div>}

            <form className="support__form" onSubmit={handleSubmit}>
              <div className="support__row">
                <div className="support__field">
                  <label className="support__label" htmlFor="name">Your Name</label>
                  <input
                    id="name"
                    className="support__input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Nepal Life"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="support__field">
                  <label className="support__label" htmlFor="email">Your Email</label>
                  <input
                    id="email"
                    className="support__input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="support__field">
                <label className="support__label" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  className="support__input"
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Short summary of your issue"
                  required
                />
              </div>

              <div className="support__field">
                <label className="support__label" htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  className="support__textarea"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe the issue with details (steps, error message, etc.)"
                  required
                  rows={6}
                />
              </div>

              <button className="support__button" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
