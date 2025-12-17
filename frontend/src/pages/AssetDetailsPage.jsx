// src/pages/AssetDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer.jsx";
import AssetDetail from "../components/AssetDetail.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Assets.css";

export default function AssetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchAsset = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/assets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;

        if (!data) {
          setError("Asset not found.");
          setAsset(null);
          return;
        }

        const normalized = {
          id: data.id,
          assetCode: data.assetCode,
          assetName: data.assetName,
          group: data.groupId || "-",
          subCategory: data.subCategoryCode || "-",
          brand: data.brand || "-",
          branch: data.branch || "-",
          department: data.department?.name || data.departmentId || "-",
          userAllocated: data.userAllocated || "Unallocated",
          status: data.status || "-",
          condition: data.assetCondition || data.condition || "-",
          cpu: data.technical?.cpu || "",
          ram: data.technical?.ram || "",
          os: data.technical?.os || "",
          storage: data.technical?.storage || "",
          ipAddress: data.technical?.ipAddress || "",
          domainName: data.technical?.domainName || "",
          serialNo: data.technical?.serialNo || "",
          otherSpecs: data.technical?.otherSpecs || "",
          vendorName: data.commercial?.vendorName || "",
          purchaseDate: data.purchaseDate || "",
          warrantyExp: data.warrantyExp || "",
          amount: data.commercial?.amount ?? "",
          amcProvider: data.commercial?.amcVendor || "",
          noOfLicenses: data.license?.noOfLicenses ?? "",
          licenseExpDate: data.license?.licenseExp || "",
          remarks: (data.remarks || []).map((r, idx) => ({
            sn: idx + 1,
            assetId: r.assetId,
            dateUpdated: r.dateUpdated
              ? new Date(r.dateUpdated).toLocaleString()
              : "-",
            updatedBy: r.updatedBy || "-",
            remarks: r.remarks || "-",
          })),
        };

        setAsset(normalized);
      } catch (err) {
        console.error("Error fetching asset:", err);
        setError(
          err.response?.data?.message || "Failed to load asset details."
        );
        setAsset(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id, token]);

  if (loading) return <main className="assets-page"><h3>Loading Asset Details...</h3></main>;

  if (error || !asset)
    return (
      <main className="assets-page">
        {error && <p>{error}</p>}
        {!error && <p>Asset not found.</p>}
        <button className="btn ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </main>
    );

  const handleDelete = async (assetToDelete) => {
    const ok = window.confirm(
      `Are you sure you want to delete asset ${
        assetToDelete.assetCode || assetToDelete.id
      }?`
    );
    if (!ok) return;

    try {
      await api.delete(`/api/assets/${assetToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Asset deleted successfully.");
      setTimeout(() => navigate(-1), 200);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete asset.");
    }
  };

  return (
    <main className="assets-page">
      <div className="details-wrapper">
        <AssetDetail
          asset={asset}
          onClose={() => navigate(-1)}
          user={user}
          onDelete={handleDelete}
        />
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}
