import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Pages.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess("Registration successful. You can login now.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">

        {/* LEFT SIDE — INFO PANEL */}
        <div className="login-card login-card--info">
          <h2 className="login-info-title">Create Your Account</h2>

          <div className="login-info">
            <div className="login-info-block">
              <h4>👤 User Registration</h4>
              <p>
                Register using your official email address to access the
                Inventory Management System.
              </p>
            </div>

            <div className="login-info-block">
              <h4>🔐 Secure Credentials</h4>
              <p>
                Passwords are encrypted and securely stored. Never share your
                login details with anyone.
              </p>
            </div>

            <div className="login-info-block">
              <h4>🛡 Role-Based Access</h4>
              <p>
                Access level is assigned by administrators after registration.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — REGISTER FORM */}
        <div className="login-card login-card--form">
          <div className="login-card-inner">
            <h3 className="login-title">Register</h3>

            <form className="login-form" onSubmit={submit}>
              <input
                className="login-input"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <input
                className="login-input"
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />

              <input
                className="login-input"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <input
                className="login-input"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />

              <button className="login-btn" type="submit">
                Create Account
              </button>
               <p className="login-foot">
            Already have an account?{" "}
            <Link to="/login">Login here</Link>
          </p>

              {error && <p className="login-error">{error}</p>}
              {success && (
                <p style={{ color: "green", textAlign: "center" }}>
                  {success}
                </p>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
