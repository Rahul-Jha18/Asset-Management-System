import React, { useState } from "react";

import "../styles/supprt.css";

export default function SupportPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  // add this state near top (below useState form)
const [openFaq, setOpenFaq] = useState(null);

const toggleFaq = (index) => {
  setOpenFaq(openFaq === index ? null : index);
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Replace with your backend/API call
    // Example: await fetch("/api/support", { method: "POST", body: JSON.stringify(form) })

    alert("Thanks! Your message has been submitted.");
    setForm({ name: "", email: "", subject: "", message: "" });
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

            <div className="support__quick">
              <a className="support__quickCard" href="mailto:support@example.com">
                <div className="support__quickIcon" aria-hidden="true">✉️</div>
                <div>
                  <p className="support__quickLabel">Email Support</p>
                  <p className="support__quickValue">support@example.com</p>
                </div>
              </a>

              <div className="support__quickCard">
                <div className="support__quickIcon" aria-hidden="true">⏱️</div>
                <div>
                  <p className="support__quickLabel">Typical Response</p>
                  <p className="support__quickValue">Within 24 hours</p>
                </div>
              </div>

              <div className="support__quickCard">
                <div className="support__quickIcon" aria-hidden="true">🧩</div>
                <div>
                  <p className="support__quickLabel">Help Topics</p>
                  <p className="support__quickValue">Account • Billing • Technical</p>
                </div>
              </div>
            </div>
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
                    a: "Go to the login page and click 'Forgot Password'. You’ll receive a reset link in your email. Check spam/junk if you don’t see it."
                },
                {
                    q: "How do I contact support?",
                    a: "You can email us at support@example.com or use the contact form on this page."
                },
                {
                    q: "What information should I include?",
                    a: "Include your account email, device/browser details, steps to reproduce the issue, and screenshots if possible."
                }
                ].map((item, index) => (
                <div
                    key={index}
                    className={`support__faqItem ${openFaq === index ? "active" : ""}`}
                    onClick={() => toggleFaq(index)}
                >
                    <div className="support__faqQuestion">
                    <h3 className="support__h3">{item.q}</h3>
                    <span className="support__faqIcon">
                        {openFaq === index ? "v" : ">"}
                    </span>
                    </div>

                    {openFaq === index && (
                    <p className="support__faqAnswer">{item.a}</p>
                    )}
                </div>
                ))}
            </div>
            </section>


          {/* Contact Form */}
          <aside className="support__section support__card">
            <div className="support__sectionHeader">
              <h2 className="support__h2">Contact Support</h2>
              <p className="support__desc">
                Send us a message and we’ll get back to you as soon as possible.
              </p>
            </div>

            <form className="support__form" onSubmit={handleSubmit}>
              <div className="support__row">
                <div className="support__field">
                  <label className="support__label" htmlFor="name">
                    Your Name
                  </label>
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
                  <label className="support__label" htmlFor="email">
                    Your Email
                  </label>
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
                <label className="support__label" htmlFor="subject">
                  Subject
                </label>
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
                <label className="support__label" htmlFor="message">
                  Your Message
                </label>
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

              <button className="support__button" type="submit">
                Submit Request
              </button>

              <p className="support__note">
                By submitting, you agree that we may contact you about this request.
              </p>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
