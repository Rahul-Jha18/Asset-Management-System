// src/pages/BranchDetails.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer.jsx";
import BranchDetail from "../components/common/BranchDetail.jsx";
import Alert from '../components/common/Alert';
import "../styles/Pages.css";


export default function BranchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAdmin, isSubAdmin } = useAuth();

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchBranch = useCallback(async () => {
    if (!id || !token) return;

    try {
      setLoading(true);
      setAlert(null);

      const res = await api.get(`/api/branches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = res?.data?.data ?? res?.data ?? null;
      setBranch(payload);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message;

      setBranch(null);
      setAlert({
        type: "error",
        title: "Error",
        message: `Status: ${status || "N/A"} - ${msg || "Failed to load branch details"}`,
      });
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchBranch();
  }, [fetchBranch]);

  const handleBranchSelect = (newBranchId) => {
    if (!newBranchId) return;
    navigate(`/branches/${newBranchId}`);
  };

  if (loading) {
    return (
      <>
        <main className="assets-page">
          <div className="details-wrapper">
            <div style={{ padding: 16, fontWeight: 700 }}>Loading...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!branch) {
    return (
      <>
        <main className="assets-page">
          <div className="details-wrapper">
            {alert && (
              <Alert
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}
            <div style={{ padding: 16, fontWeight: 700 }}>Branch not found</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="assets-page">
        <div className="details-wrapper">
          {alert && (
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <BranchDetail
            branch={branch}
            token={token}
            isAdmin={isAdmin}
            isSubAdmin={isSubAdmin}
            onClose={() => navigate(-1)}
            onRefresh={fetchBranch}
            onBranchSelect={handleBranchSelect}
            defaultRightView="branches"   
          />
        </div>
      </main>
      <Footer />
    </>
  );
}