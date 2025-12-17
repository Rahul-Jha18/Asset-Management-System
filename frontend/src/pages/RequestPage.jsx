import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  getRequests,
  getAllRequests,
  addRequest,
  updateRequestStatus,
  deleteRequest,
} from "../services/requestService";

import { getBranches } from "../services/branchService";
import { getAssets } from "../services/assetService";

import Alert from "../components/Alert";
import Button from "../components/Button";
import Footer from "../components/Layout/Footer";
import "../styles/Pages.css";

export default function RequestPage() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isSubadmin = user?.role === "subadmin";
  const isUser = user?.role === "user";

  const canCreate = isUser;
  const canManage = isAdmin || isSubadmin;
  const canDelete = isAdmin;

  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [assets, setAssets] = useState([]);

  const [loadingAssets, setLoadingAssets] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    type: "add_asset",
    branchId: "",
    assetId: "",
    description: "",
  });

  // ---------------- FETCH DATA ----------------

  const fetchRequests = async () => {
    const data = canManage ? await getAllRequests() : await getRequests();
    setRequests(data);
  };

  const fetchBranches = async () => {
    const data = await getBranches();
    setBranches(data);
  };

  const fetchAssetsForBranch = async (branchId) => {
    try {
      setLoadingAssets(true);

      const branch = branches.find(
        (b) => String(b.id) === String(branchId)
      );

      if (!branch) {
        setAssets([]);
        return;
      }

      // IMPORTANT: backend expects branch NAME
      const data = await getAssets({ branch: branch.name });
      setAssets(data);
    } catch (err) {
      console.error("fetchAssetsForBranch:", err);
      setAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  // ---------------- EFFECTS ----------------

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (user?.role) fetchRequests();
  }, [user?.role]);

  useEffect(() => {
    if (!formData.branchId) {
      setAssets([]);
      return;
    }
    fetchAssetsForBranch(formData.branchId);
    setFormData((p) => ({ ...p, assetId: "" }));
  }, [formData.branchId]);

  // ---------------- HANDLERS ----------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.branchId) {
      setAlert({ type: "error", title: "Error", message: "Branch is required" });
      return;
    }

    await addRequest({
      type: formData.type,
      description: formData.description,
      branchId: formData.branchId,
      deviceId: formData.assetId || null, // assetId stored here
    });

    setAlert({ type: "success", title: "Success", message: "Request submitted" });
    setShowForm(false);
    setFormData({ type: "add_asset", branchId: "", assetId: "", description: "" });
    fetchRequests();
  };

  const handleStatusChange = async (id, status) => {
    await updateRequestStatus(id, status);
    fetchRequests();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    await deleteRequest(id);
    fetchRequests();
  };

  // ---------------- RENDER ----------------

  return (
    <>
      <main className="page-container">
        <h2>Request Management</h2>

        {canCreate && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "New Request"}
          </Button>
        )}

        {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

        {/* ---------- FORM ---------- */}
        {canCreate && showForm && (
          <form onSubmit={handleSubmit} className="request-form">
            <label>Branch *</label>
            <select name="branchId" value={formData.branchId} onChange={handleChange}>
              <option value="">-- Select Branch --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <label>Asset (based on branch)</label>
            <select
              name="assetId"
              value={formData.assetId}
              onChange={handleChange}
              disabled={loadingAssets}
            >
              <option value="">-- Select Asset --</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetCode} - {a.assetName}
                </option>
              ))}
            </select>

            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <Button type="submit">Submit</Button>
          </form>
        )}

        {/* ---------- TABLE ---------- */}
        <table className="device-table">
          <thead>
            <tr>
              {canManage && <th>User</th>}
              <th>Branch</th>
              <th>Asset</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                {canManage && <td>{r.user?.name}</td>}
                <td>{r.branch?.name}</td>
                <td>{r.deviceId || "-"}</td>
                <td>{r.description}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>

                {canManage && (
                  <td>
                    <select
                      style={{background:'#98e25bff', padding: '12px 7px',marginRight:'10px',
                        border:"none" ,borderRadius:'15px', fontWeight:'bold',
                        textAlign:'center'}}
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Done">Done</option>
                    </select>

                    {canDelete && (
                      <Button variant="danger" onClick={() => handleDelete(r.id)}>
                        Delete
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <Footer />
    </>
  );
}
