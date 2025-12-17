// src/pages/BranchDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer.jsx";
import BranchDetail from "../components/BranchDetail";
import "../styles/Pages.css";

export default function BranchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAdmin, isSubAdmin } = useAuth();

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranch = async () => {
      if (!id || !token) return;

      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/api/branches/${id}`, {
          headers: { Authorization: `Bearer ${token}`},
        });

        // backend responses are formatted as { success, message, data }
        const payload = res?.data?.data ?? res?.data ?? null;
        setBranch(payload);
      } catch (err) {
        console.error(err);
        setError("Failed to load branch details");
        setBranch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [id, token]);

  if (loading) {
    return (
      <>
        <main className="branch-layout">
          <h3>Loading Branch Details...</h3>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !branch) {
    return (
      <>
        <main className="branch-layout">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <p style={{ color: "red" }}>{error || "Branch not found"}</p>
        </main>
        <Footer />
      </>
    );
  }
  return (
    <>
      <main className="assets-page">
        <div className="details-wrapper">
          <BranchDetail
            branch={branch}
            token={token}
            isAdmin={isAdmin}
            isSubAdmin={isSubAdmin}
            onClose={() => navigate(-1)}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
