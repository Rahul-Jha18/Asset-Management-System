// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as XLSX from "xlsx";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [excelSuccess, setExcelSuccess] = useState("");

  // Clear nav/login info
  const handleLogout = async () => {
    await logout?.();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    await handleLogout();

    // Frontend validation
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setError("Name, email, and password are required.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess("Registration successful! Redirecting to login...");
      localStorage.removeItem("ims_creds");
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.log(err.response?.data);
      const backendErrors = err.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        setError(backendErrors.join(", "));
      } else {
        setError(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setExcelSuccess("");
    setLoadingImport(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const users = XLSX.utils.sheet_to_json(worksheet);
        if (!users.length) throw new Error("Excel file is empty.");

        const res = await api.post("/api/users/import", { users });
        setExcelSuccess(res.data.message || "Users imported successfully!");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Import failed");
      } finally {
        setLoadingImport(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        {/* Register Form */}
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
        </form>

        {/* Bulk Excel Import */}
        <div className="mt-6 text-center border-t pt-4 space-y-2">
          <p className="font-semibold text-gray-700">Bulk Import Users</p>
          <label className={`cursor-pointer inline-block w-full py-2 px-4 rounded-lg font-medium transition ${
            loadingImport ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}>
            Choose Excel File
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
              disabled={loadingImport}
            />
          </label>
          {loadingImport && <p className="text-gray-600 text-sm mt-1">Importing...</p>}
          {excelSuccess && <p className="text-green-600 text-sm mt-1">{excelSuccess}</p>}
        </div>

        {/* Login / Logout */}
        <div className="mt-4 text-center text-sm">
          {user ? (
            <Link
              to="/"
              className="text-blue-600 hover:underline font-medium"
              onClick={handleLogout}
            >
              Go to Home / Logout
            </Link>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Login here
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
