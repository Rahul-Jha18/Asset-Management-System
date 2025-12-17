import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginApi } from "../services/authService";
import "../styles/Pages.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

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
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        {/* LEFT CARD (with BG image) */}
        <div
          className="login-card login-card--image"
        >
          <div className="login-card-overlay">
            <div className="login-card-inner">
              <h3 className="login-title">Login</h3>

              <form className="login-form" onSubmit={submit}>
                <input
                  className="login-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="login-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="login-row">
                  <label className="login-check">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                </div>

                <button className="login-btn" type="submit">
                  Login
                </button>

                <p className="login-foot">
                  Not registered? <Link to="/register">Register</Link>
                </p>

                {error && <p className="login-error">{error}</p>}
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT CARD (info) */}
        <div className="login-card login-card--info">
          <h3 className="login-info-title">How Login Works</h3>

          <div className="login-info">
            <div className="login-info-block">
              <h4>1) Authentication</h4>
              <p>
                On submitting the form, a POST request is sent to the backend API
              </p>
            </div>

            <div className="login-info-block">
              <h4>2) Remember Me</h4>
              <p>
                If "Remember Me" is checked, your email and password are stored in
                localStorage for future logins.
              </p>
            </div>

            <div className="login-info-block">
              <h4>3) Role-based Redirect</h4>
              <p>
                After login, the app redirects:
                <br />
                <b>admin/subadmin</b> → <code>/AdminRequests</code>
                <br />
                <b>user</b> → <code>/</code>
              </p>
            </div>

            <div className="login-info-block">
              <h4>4) Error Handling</h4>
              <p>
                If backend rejects login, the page shows the backend message
                (or “Login failed”).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
