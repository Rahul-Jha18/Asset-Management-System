// src/pages/RequestPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
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

const initialValues = {
  // request core
  type: "",
  title: "",
  category: "",
  sub_category: "",
  asset: "",
  priority: "Medium",
  description: "",
  status: "Pending",
  branchId: "",
  deviceId: "",

  // professional fields (optional columns)
  requestedByName: "",
  requestedByContact: "",
  purchaseDate: "",
  warrantyExpiry: "",
  invoiceNo: "",
  vendorName: "",
  province: "",
  district: "",
  localLevel: "",
  fiscalYear: "",

  // mandatory agreement
  agreeAccuracy: false,
};

export default function RequestPage() {
  const { token, user, isAdmin, isSubAdmin } = useAuth();
  const navigate = useNavigate();

  const canManage = isAdmin || isSubAdmin;
  const isUser = user?.role === "user";

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

  // Pagination (works even if API not paginated)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm(initialValues, onSubmitForm);

  const bindInput = (name) => ({
    name,
    value: values[name] ?? "",
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    touched: touched[name],
  });

  // Helpers to read request values no matter backend format
  const getReqBranchId = (r) => r?.branchId ?? r?.branch_id ?? null;
  const getReqDeviceId = (r) => r?.deviceId ?? r?.device_id ?? null;
  const getReqUserId = (r) => r?.userId ?? r?.user_id ?? null;

  // ----------- Fetching ----------
  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // ✅ Admin/SubAdmin sees ALL
      const url = canManage ? "/api/requests/all" : "/api/requests";

      const res = await api.get(url, {
        // If backend not paginated, these params will be ignored safely
        params: { page: currentPage, limit: pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res?.data;
      const payload = Array.isArray(data) ? data : data?.data ?? [];
      const pagination = data?.pagination ?? {};

      setRequests(Array.isArray(payload) ? payload : []);
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || (Array.isArray(payload) ? payload.length : 0));
    } catch (err) {
      setAlert({ type: "error", title: "Error", message: "Failed to fetch requests" });
    } finally {
      setLoading(false);
    }
  }, [token, canManage, currentPage, pageSize]);

  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/branches", {
        params: { page: 1, limit: 5000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setBranches(Array.isArray(payload) ? payload : []);
    } catch {
      setBranches([]);
    }
  }, [token]);

  const fetchDevices = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/devices", {
        params: { page: 1, limit: 5000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setDevices(Array.isArray(payload) ? payload : []);
    } catch {
      setDevices([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchRequests();
    fetchBranches();
    fetchDevices();
  }, [token, fetchRequests, fetchBranches, fetchDevices]);

  // Client-side search
  const filteredRequests = useMemo(() => {
    const q = (debouncedSearch || "").toLowerCase();
    if (!q) return requests;

    return requests.filter((r) => {
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
  }, [requests, debouncedSearch]);

  // ----------- Submit (Add/Edit) ----------
  async function onSubmitForm(formValues) {
    if (!token) return;

    if (!user) {
      setAlert({ type: "error", title: "Error", message: "You do not have permission" });
      return;
    }

    // ✅ only USER can create new requests (UI + backend should enforce)
    if (!editingId && !isUser) {
      setAlert({
        type: "error",
        title: "Not allowed",
        message: "Admin/SubAdmin cannot create requests. Please respond to existing requests.",
      });
      return;
    }

    // ✅ mandatory agreement for user create (and for edit too if you want)
    if (!formValues.agreeAccuracy) {
      setAlert({
        type: "error",
        title: "Agreement required",
        message: "Please confirm the agreement checkbox before submitting.",
      });
      return;
    }

    const payload = {
      type: formValues.type,
      title: formValues.title || null,
      category: formValues.category || null,
      sub_category: formValues.sub_category || null,
      asset: formValues.asset || null,
      priority: formValues.priority || "Medium",
      description: formValues.description,

      // For edit, status can be changed. For create, backend sets Pending anyway.
      status: formValues.status || "Pending",

      branchId: formValues.branchId ? Number(formValues.branchId) : null,
      deviceId: formValues.deviceId ? Number(formValues.deviceId) : null,

      requestedByName: formValues.requestedByName || null,
      requestedByContact: formValues.requestedByContact || null,
      purchaseDate: formValues.purchaseDate || null,
      warrantyExpiry: formValues.warrantyExpiry || null,
      invoiceNo: formValues.invoiceNo || null,
      vendorName: formValues.vendorName || null,
      province: formValues.province || null,
      district: formValues.district || null,
      localLevel: formValues.localLevel || null,
      fiscalYear: formValues.fiscalYear || null,

      agreeAccuracy: true,
    };

    try {
      if (editingId) {
        if (!canManage) {
          setAlert({ type: "error", title: "Error", message: "You do not have permission" });
          return;
        }

        // ✅ IMPORTANT: full edit endpoint is /:id/edit
        await api.put(`/api/requests/${editingId}/edit`, payload, {
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

  // ----------- Admin quick status update (table dropdown) ----------
  const updateStatusQuick = useCallback(
    async (id, status) => {
      if (!canManage) return;
      try {
        await api.put(
          `/api/requests/${id}`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlert({ type: "success", title: "Success", message: "Status updated!" });
        fetchRequests();
      } catch (err) {
        setAlert({ type: "error", title: "Error", message: "Failed to update status" });
      }
    },
    [canManage, token, fetchRequests]
  );

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
        ...initialValues,
        type: req.type || "",
        title: req.title || "",
        category: req.category || "",
        sub_category: req.sub_category || "",
        asset: req.asset || "",
        priority: req.priority || "Medium",
        description: req.description || "",
        status: req.status || "Pending",
        branchId: getReqBranchId(req) ? String(getReqBranchId(req)) : "",
        deviceId: getReqDeviceId(req) ? String(getReqDeviceId(req)) : "",

        requestedByName: req.requestedByName || req.requested_by_name || "",
        requestedByContact: req.requestedByContact || req.requested_by_contact || "",
        purchaseDate: req.purchaseDate || req.purchase_date || "",
        warrantyExpiry: req.warrantyExpiry || req.warranty_expiry || "",
        invoiceNo: req.invoiceNo || req.invoice_no || "",
        vendorName: req.vendorName || req.vendor_name || "",
        province: req.province || "",
        district: req.district || "",
        localLevel: req.localLevel || req.local_level || "",
        fiscalYear: req.fiscalYear || req.fiscal_year || "",

        // ✅ require agreement again on edit
        agreeAccuracy: false,
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

          {/* ✅ Only normal USER can create request */}
          {isUser && (
            <Button variant="primary" onClick={handleOpenForm}>
              + New Request
            </Button>
          )}
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
                form="request-form"
                loading={isSubmitting}
                disabled={!values.agreeAccuracy}
                title={!values.agreeAccuracy ? "Please accept the agreement to submit" : ""}
              >
                {editingId ? "Update Request" : "Submit Request"}
              </Button>
            </div>
          }
        >
          <form id="request-form" className="request-form" onSubmit={handleSubmit}>
            <h4 className="form-section-title">Request Information</h4>

            <div className="form-grid">
              <FormInput label="Request Type" required placeholder="Hardware/Software/Support" {...bindInput("type")} />
              <FormInput label="Title" placeholder="Short title" {...bindInput("title")} />
            </div>

            <div className="form-grid">
              <FormInput label="Category" placeholder="Network, CCTV, Printer..." {...bindInput("category")} />
              <FormInput label="Sub Category" placeholder="Router, NVR, Toner..." {...bindInput("sub_category")} />
            </div>

            <FormInput label="Asset / Item" placeholder="Device name / asset tag" {...bindInput("asset")} />

            <div className="form-grid">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={values.priority} onChange={handleChange} onBlur={handleBlur}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              {/* ✅ Only admin/subadmin should change status */}
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!canManage}
                  title={!canManage ? "Only Admin/SubAdmin can change status" : ""}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Completed</option>
                  <option>Done</option>
                </select>
              </div>
            </div>

            <h4 className="form-section-title">Requester</h4>
            <div className="form-grid">
              <FormInput label="Requested By" placeholder="Employee name" {...bindInput("requestedByName")} />
              <FormInput label="Contact" placeholder="Phone/Extension" {...bindInput("requestedByContact")} />
            </div>

            <h4 className="form-section-title">Asset Details</h4>
            <div className="form-grid">
              <FormInput label="Purchase Date (AD)" type="date" {...bindInput("purchaseDate")} />
              <FormInput label="Warranty Expiry (AD)" type="date" {...bindInput("warrantyExpiry")} />
            </div>

            <div className="form-grid">
              <FormInput label="Invoice No." placeholder="Invoice / Bill no." {...bindInput("invoiceNo")} />
              <FormInput label="Vendor Name" placeholder="Supplier / vendor" {...bindInput("vendorName")} />
            </div>

            <h4 className="form-section-title">Location (Nepal)</h4>
            <div className="form-grid">
              <FormInput label="Province" placeholder="Bagmati" {...bindInput("province")} />
              <FormInput label="District" placeholder="Kathmandu" {...bindInput("district")} />
            </div>

            <div className="form-grid">
              <FormInput label="Local Level" placeholder="KMC / Municipality" {...bindInput("localLevel")} />
              <FormInput label="Fiscal Year (BS)" placeholder="2082/83" {...bindInput("fiscalYear")} />
            </div>

            <h4 className="form-section-title">Office / Asset Mapping</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Branch</label>
                <select
                  name="branchId"
                  value={values.branchId}
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

              <div className="form-group">
                <label>Device (optional)</label>
                <select name="deviceId" value={values.deviceId} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">-- Optional Device --</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.asset_tag || d.serial_no}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h4 className="form-section-title">Description</h4>
            <FormInput
              label="Description"
              textarea
              required
              placeholder="Write details of the issue / request..."
              {...bindInput("description")}
            />

            <div className="form-group agreement-box">
              <label className="agreement-label">
                <input
                  type="checkbox"
                  name="agreeAccuracy"
                  checked={!!values.agreeAccuracy}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <span>
                  I confirm that all the information provided above is correct. If any mistake is found, I will be
                  responsible.
                </span>
              </label>
            </div>
          </form>
        </Modal>

        {/* ---------- Details Modal ---------- */}
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
              {(() => {
                const r = selectedRequest;

                // helper to read camelCase OR snake_case OR null
                const pick = (...keys) => {
                  for (const k of keys) {
                    if (r?.[k] !== undefined && r?.[k] !== null && r?.[k] !== "") return r[k];
                  }
                  return "—";
                };

                const branchId = getReqBranchId(r);
                const deviceId = getReqDeviceId(r);

                const created = pick("created_at", "createdAt");
                const updated = pick("updated_at", "updatedAt");

                return (
                  <>
                    <div><strong>ID:</strong> {pick("id")}</div>
                    <div><strong>User:</strong> {pick("userId", "user_id", "user")?.name || pick("userId", "user_id")}</div>

                    <hr />

                    <div><strong>Type:</strong> {pick("type")}</div>
                    <div><strong>Title:</strong> {pick("title")}</div>
                    <div><strong>Category:</strong> {pick("category")}</div>
                    <div><strong>Sub Category:</strong> {pick("sub_category", "subCategory")}</div>
                    <div><strong>Asset:</strong> {pick("asset")}</div>
                    <div><strong>Priority:</strong> {pick("priority")}</div>
                    <div><strong>Status:</strong> {pick("status")}</div>

                    <hr />

                    <div><strong>Branch:</strong> {getBranchName(branchId)}</div>
                    <div><strong>Device:</strong> {getDeviceLabel(deviceId)}</div>

                    <hr />

                    <div><strong>Requested By:</strong> {pick("requestedByName", "requested_by_name")}</div>
                    <div><strong>Requester Contact:</strong> {pick("requestedByContact", "requested_by_contact")}</div>

                    <hr />

                    <div><strong>Purchase Date (AD):</strong> {pick("purchaseDate", "purchase_date")}</div>
                    <div><strong>Warranty Expiry (AD):</strong> {pick("warrantyExpiry", "warranty_expiry")}</div>
                    <div><strong>Invoice No:</strong> {pick("invoiceNo", "invoice_no")}</div>
                    <div><strong>Vendor Name:</strong> {pick("vendorName", "vendor_name")}</div>

                    <hr />

                    <div><strong>Province:</strong> {pick("province")}</div>
                    <div><strong>District:</strong> {pick("district")}</div>
                    <div><strong>Local Level:</strong> {pick("localLevel", "local_level")}</div>
                    <div><strong>Fiscal Year (BS):</strong> {pick("fiscalYear", "fiscal_year")}</div>

                    <hr />

                    <div><strong>Description:</strong> {pick("description")}</div>

                    <hr />

                    <div><strong>Agreement Accepted:</strong> {String(pick("agreeAccuracy", "agree_accuracy") === true || pick("agreeAccuracy", "agree_accuracy") === 1 ? "Yes" : "No")}</div>
                    <div><strong>Created:</strong> {created}</div>
                    <div><strong>Updated:</strong> {updated}</div>
                  </>
                );
              })()}
            </div>
          ) : (
            <p>No request selected.</p>
          )}

        </Modal>

        {/* ---------- Table ---------- */}
        <div className="table-wrapper">
          {filteredRequests.length ? (
            <table className="device-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Branch</th>
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
                      <td>{uId ?? r?.user?.name ?? "—"}</td>
                      <td>{r.title || "—"}</td>
                      <td>{r.category || "—"}</td>
                      <td>{r.sub_category || "—"}</td>
                      <td>{r.asset || "—"}</td>
                      <td>{r.priority || "—"}</td>

                      {/* ✅ Admin/SubAdmin can change status quickly here */}
                      <td>
                        {canManage ? (
                          <select
                            value={r.status}
                            onChange={(e) => updateStatusQuick(r.id, e.target.value)}
                          >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                            <option>Completed</option>
                            <option>Done</option>
                          </select>
                        ) : (
                          r.status
                        )}
                      </td>

                      <td>{getBranchName(bId)}</td>
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
