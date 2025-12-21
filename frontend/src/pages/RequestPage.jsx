// src/pages/RequestPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForm, useDebounce } from "../hooks";
import api from "../services/api";

import Footer from "../components/Layout/Footer";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import Alert from "../components/Alert";
import { SkeletonTable } from "../components/Loading";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import "../styles/Pages.css";

export default function RequestPage() {
  const { token, user, isAdmin, isSubAdmin } = useAuth();
  const navigate = useNavigate();

  const canManage = isAdmin || isSubAdmin;

  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ✅ Form state: use camelCase keys expected by backend
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm(
    {
      type: "",
      title: "",
      category: "",
      sub_category: "",
      asset: "",
      priority: "Medium",
      description: "",
      status: "Pending",
      branchId: "",     // ✅ was branch_id
      deviceId: "",     // ✅ was device_id
    },
    onSubmitForm
  );

  // ----------- Fetching ----------
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE:
      // Your backend currently has getUserRequests/getAllRequests (not paginated).
      // If /api/requests returns an array, this code still works.
      const res = await api.get("/api/requests", {
        params: { page: currentPage, limit: pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res?.data;

      // Support both: paginated {data, pagination} or plain array
      const payload = Array.isArray(data) ? data : (data?.data ?? []);
      const pagination = data?.pagination ?? {};

      setRequests(Array.isArray(payload) ? payload : []);
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || (Array.isArray(payload) ? payload.length : 0));
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to fetch requests",
      });
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize]);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await api.get("/api/branches", {
        params: { page: 1, limit: 5000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setBranches(Array.isArray(payload) ? payload : []);
    } catch (e) {
      setBranches([]);
    }
  }, [token]);

  const fetchDevices = useCallback(async () => {
    try {
      // If your backend doesn't have /api/devices, this will fail silently
      const res = await api.get("/api/devices", {
        params: { page: 1, limit: 5000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setDevices(Array.isArray(payload) ? payload : []);
    } catch (e) {
      setDevices([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchRequests();
    fetchBranches();
    fetchDevices();
  }, [token, fetchRequests, fetchBranches, fetchDevices]);

  // Helpers to read request values no matter backend format
  const getReqBranchId = (r) => r?.branchId ?? r?.branch_id ?? null;
  const getReqDeviceId = (r) => r?.deviceId ?? r?.device_id ?? null;
  const getReqUserId = (r) => r?.userId ?? r?.user_id ?? null;

  // Client-side search
  const filteredRequests = requests.filter((r) => {
    const q = debouncedSearch.toLowerCase();
    const s = [
      r?.type,
      r?.title,
      r?.category,
      r?.sub_category,
      r?.asset,
      r?.status,
      r?.description,
      String(getReqBranchId(r) ?? ""),
      String(getReqDeviceId(r) ?? ""),
      String(getReqUserId(r) ?? ""),
      String(r?.id ?? ""),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return s.includes(q);
  });

  // ----------- Submit (Add/Edit) ----------
  async function onSubmitForm(formValues) {
    if (!token) return;

    const canCreate = !!user;
    if (!canCreate) {
      setAlert({ type: "error", title: "Error", message: "You do not have permission" });
      return;
    }

    // ✅ Backend expects branchId/deviceId (camelCase)
    const payload = {
      type: formValues.type,
      title: formValues.title || null,
      category: formValues.category || null,
      sub_category: formValues.sub_category || null,
      asset: formValues.asset || null,
      priority: formValues.priority || "Medium",
      description: formValues.description,
      // status on create can be ignored by backend; keep for admins edit
      status: formValues.status || "Pending",

      branchId: formValues.branchId ? Number(formValues.branchId) : null,   // ✅ required
      deviceId: formValues.deviceId ? Number(formValues.deviceId) : null,
    };

    try {
      if (editingId) {
        if (!canManage) {
          setAlert({ type: "error", title: "Error", message: "You do not have permission" });
          return;
        }
        await api.put(`/api/requests/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ type: "success", title: "Success", message: "Request updated successfully!" });
      } else {
        await api.post("/api/requests", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ type: "success", title: "Success", message: "Request submitted successfully!" });
      }

      resetForm();
      setEditingId(null);
      setShowModal(false);
      setCurrentPage(1);
      fetchRequests();
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: err.response?.data?.message || "Failed to save request",
      });
    }
  }

  // ----------- Actions ----------
  const handleOpenForm = useCallback(() => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
    setEditingId(null);
  }, [resetForm]);

  const handleEdit = useCallback(
    (req) => {
      if (!canManage) return;

      setEditingId(req.id);

      resetForm({
        type: req.type || "",
        title: req.title || "",
        category: req.category || "",
        sub_category: req.sub_category || "",
        asset: req.asset || "",
        priority: req.priority || "Medium",
        description: req.description || "",
        status: req.status || "Pending",

        // ✅ read from either field style
        branchId: getReqBranchId(req) ? String(getReqBranchId(req)) : "",
        deviceId: getReqDeviceId(req) ? String(getReqDeviceId(req)) : "",
      });

      setShowModal(true);
    },
    [canManage, resetForm]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!isAdmin) return;
      if (!window.confirm("Are you sure you want to delete this request?")) return;

      try {
        await api.delete(`/api/requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ type: "success", title: "Success", message: "Request deleted successfully!" });
        fetchRequests();
      } catch (err) {
        setAlert({ type: "error", title: "Error", message: "Failed to delete request" });
      }
    },
    [isAdmin, token, fetchRequests]
  );

  const openDetail = useCallback((req) => {
    setSelectedRequest(req);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedRequest(null);
    setDetailOpen(false);
  }, []);

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const getBranchName = (branchId) => {
    const id = Number(branchId);
    const b = branches.find((x) => Number(x.id) === id);
    return b?.name || branchId || "—";
  };

  const getDeviceLabel = (deviceId) => {
    const id = Number(deviceId);
    const d = devices.find((x) => Number(x.id) === id);
    return d?.name || d?.asset_tag || d?.serial_no || deviceId || "—";
  };

  if (loading && requests.length === 0) {
    return (
      <>
        <main className="page-container">
          <div className="device-header">
            <h2>Request Management</h2>
          </div>
          <SkeletonTable rows={5} cols={10} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="page-container">
        <div className="device-header">
          <h2>Request Management</h2>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="device-controls">
          <input
            type="text"
            placeholder="Search requests..."
            className="device-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button variant="primary" onClick={handleOpenForm}>
            + New Request
          </Button>
        </div>

        {/* ---------- Add/Edit Modal ---------- */}
        <Modal
          isOpen={showModal}
          title={editingId ? "Edit Request" : "Submit New Request"}
          onClose={closeModal}
          actions={
            <div className="modal-actions">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={isSubmitting}
                onClick={() =>
                  document
                    .querySelector(".request-form")
                    .dispatchEvent(new Event("submit", { bubbles: true }))
                }
              >
                {editingId ? "Update Request" : "Submit Request"}
              </Button>
            </div>
          }
        >
          <form className="request-form" onSubmit={handleSubmit}>
            <FormInput
              label="Type"
              name="type"
              placeholder="e.g. add_asset, repair, etc."
              value={values.type}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.type}
              touched={touched.type}
              required
            />

            <FormInput
              label="Title"
              name="title"
              placeholder="Enter title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.title}
              touched={touched.title}
            />

            <FormInput
              label="Category"
              name="category"
              placeholder="Enter category"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.category}
              touched={touched.category}
            />

            <FormInput
              label="Sub Category"
              name="sub_category"
              placeholder="Enter sub category"
              value={values.sub_category}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.sub_category}
              touched={touched.sub_category}
            />

            <FormInput
              label="Asset"
              name="asset"
              placeholder="Enter asset info"
              value={values.asset}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.asset}
              touched={touched.asset}
            />

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                name="priority"
                value={values.priority}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Status (admins can edit; create always Pending on backend) */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                name="status"
                value={values.status}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!canManage && !!editingId}
                title={!canManage && !!editingId ? "Only admin/subadmin can change status" : ""}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Branch */}
            {branches.length > 0 ? (
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select
                  className="form-control"
                  name="branchId"                 // ✅ changed
                  value={values.branchId}         // ✅ changed
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">-- Select Branch --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <FormInput
                label="Branch ID"
                name="branchId"                 // ✅ changed
                placeholder="Enter branch id"
                value={values.branchId}         // ✅ changed
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.branchId}
                touched={touched.branchId}
                required
                type="number"
              />
            )}

            {/* Device */}
            {devices.length > 0 ? (
              <div className="form-group">
                <label className="form-label">Device</label>
                <select
                  className="form-control"
                  name="deviceId"                // ✅ changed
                  value={values.deviceId}        // ✅ changed
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">-- Select Device (optional) --</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.asset_tag || d.serial_no || `Device #${d.id}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <FormInput
                label="Device ID"
                name="deviceId"                 // ✅ changed
                placeholder="Enter device id (optional)"
                value={values.deviceId}         // ✅ changed
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.deviceId}
                touched={touched.deviceId}
                type="number"
              />
            )}

            <FormInput
              label="Description"
              name="description"
              placeholder="Enter request description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.description}
              touched={touched.description}
              required
            />
          </form>
        </Modal>

        {/* ---------- Full Details Modal ---------- */}
        <Modal
          isOpen={detailOpen}
          title="Request Full Details"
          onClose={closeDetail}
          actions={
            <div className="modal-actions">
              <Button variant="secondary" onClick={closeDetail}>
                Close
              </Button>
            </div>
          }
        >
          {selectedRequest ? (
            <div style={{ lineHeight: 1.8 }}>
              <div><strong>ID:</strong> {selectedRequest.id}</div>
              <div><strong>User ID:</strong> {getReqUserId(selectedRequest) ?? "—"}</div>
              <div><strong>Type:</strong> {selectedRequest.type}</div>
              <div><strong>Title:</strong> {selectedRequest.title || "—"}</div>
              <div><strong>Category:</strong> {selectedRequest.category || "—"}</div>
              <div><strong>Sub Category:</strong> {selectedRequest.sub_category || "—"}</div>
              <div><strong>Asset:</strong> {selectedRequest.asset || "—"}</div>
              <div><strong>Priority:</strong> {selectedRequest.priority || "—"}</div>
              <div><strong>Status:</strong> {selectedRequest.status}</div>
              <div><strong>Branch:</strong> {getBranchName(getReqBranchId(selectedRequest))}</div>
              <div><strong>Device:</strong> {getDeviceLabel(getReqDeviceId(selectedRequest))}</div>
              <div><strong>Description:</strong> {selectedRequest.description || "—"}</div>
              <div><strong>Created:</strong> {selectedRequest.created_at || selectedRequest.createdAt || "—"}</div>
              <div><strong>Updated:</strong> {selectedRequest.updated_at || selectedRequest.updatedAt || "—"}</div>
            </div>
          ) : (
            <p>No request selected.</p>
          )}
        </Modal>

        {/* ---------- Table (unchanged style) ---------- */}
        <div className="table-wrapper">
          {filteredRequests.length ? (
            <table className="device-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Branch</th>
                  <th>Device</th>
                  <th>Description</th>
                  <th>Details</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((r) => {
                  const bId = getReqBranchId(r);
                  const dId = getReqDeviceId(r);
                  const uId = getReqUserId(r);

                  return (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{uId ?? "—"}</td>
                      <td>{r.type}</td>
                      <td>{r.title || "—"}</td>
                      <td>{r.category || "—"}</td>
                      <td>{r.sub_category || "—"}</td>
                      <td>{r.asset || "—"}</td>
                      <td>{r.priority || "—"}</td>
                      <td>{r.status}</td>
                      <td>{getBranchName(bId)}</td>
                      <td>{getDeviceLabel(dId)}</td>
                      <td title={r.description}>
                        {(r.description || "—").slice(0, 40)}
                        {(r.description || "").length > 40 ? "..." : ""}
                      </td>

                      <td className="action-cell">
                        <Button size="small" variant="secondary" onClick={() => openDetail(r)}>
                          Full Details
                        </Button>
                      </td>

                      {canManage && (
                        <td className="action-cell">
                          <Button size="small" variant="primary" onClick={() => handleEdit(r)}>
                            Edit
                          </Button>
                          {isAdmin && (
                            <Button size="small" variant="danger" onClick={() => handleDelete(r.id)}>
                              Delete
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No requests found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </main>

      <Footer />
    </>
  );
}
