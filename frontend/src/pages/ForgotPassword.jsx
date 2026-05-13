import React, { useState } from "react";
import api from "../services/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      setLoading(true);
      await api.post("/api/password/forgot", { email });
      setMsg("OTP sent (if email exists). Check your inbox.");
      setStep(2);
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      setLoading(true);
      await api.post("/api/password/reset", { email, otp, newPassword });
      setMsg("Password reset successful. You can login now.");
    } catch (error) {
      setErr(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-sm bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Forgot Password
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {step === 1
              ? "Enter your email to receive an OTP"
              : "Enter OTP and set a new password"}
          </p>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mt-4">
            <div
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                step >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              1
            </div>
            <div className="w-10 h-[2px] bg-slate-300" />
            <div
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                step >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {/* Alerts */}
        {msg && (
          <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs sm:text-sm text-emerald-700">
            {msg}
          </div>
        )}

        {err && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-lg transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                OTP Code
              </label>
              <input
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none tracking-widest text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-lg transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
