// src/pages/Branch.jsx
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

const initialBranchValues = {
  name: "",
  manager_name: "",
  address: "",
  contact: "",
  ext_no: "",
  service_station_id: "",
  region: "",
};

export default function Branch() {
  const { token, isAdmin, isSubAdmin } = useAuth();
  const navigate = useNavigate();

  const canManage = isAdmin || isSubAdmin;

  const [branches, setBranches] = useState([]);
  const [serviceStations, setServiceStations] = useState([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // NOTE: We will NOT rely on resetForm(values) because some hooks don't support it.
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    // OPTIONAL: If your useForm exposes setValues, we'll use it.
    setValues,
  } = useForm(initialBranchValues, onSubmitForm);

  // Helper: safely set form values even if your useForm doesn't have setValues
  const safeSetFormValues = useCallback(
    (nextValues) => {
      if (typeof setValues === "function") {
        setValues(nextValues);
        return;
      }

      // Fallback: resetForm() then manually trigger change events (works with most hooks)
      resetForm();

      // Delay one tick so inputs render, then set by synthetic events
      setTimeout(() => {
        Object.entries(nextValues).forEach(([name, value]) => {
          const el = document.querySelector(`[name="${name}"]`);
          if (!el) return;
          el.value = value ?? "";
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }, 0);
    },
    [resetForm, setValues]
  );
  const fetchServiceStations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/service-stations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = res?.data?.data ?? res?.data ?? [];
      setServiceStations(Array.isArray(payload) ? payload : []);
    } catch (e) {
      // optional
    }
  }, [token]);

  const fetchBranches = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await api.get("/api/branches", {
        params: { page: currentPage, limit: pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = res?.data?.data ?? [];
      const pagination = res?.data?.pagination ?? {};

      setBranches(Array.isArray(payload) ? payload : []);
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || 0);
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: err.response?.data?.message || "Failed to fetch branches",
      });
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize]);

  useEffect(() => {
    if (!token) return;
    fetchBranches();
    fetchServiceStations();
  }, [token, fetchBranches, fetchServiceStations]);

  const filteredBranches = useMemo(() => {
    const q = (debouncedSearch || "").toLowerCase();
    if (!q) return branches;

    return branches.filter((b) => {
      const name = (b.name || "").toLowerCase();
      const addr = (b.address || "").toLowerCase();
      return name.includes(q) || addr.includes(q);
    });
  }, [branches, debouncedSearch]);

  const getStationName = useCallback(
    (b) => {
      if (b?.service_station_name) return b.service_station_name;
      if (b?.serviceStation?.name) return b.serviceStation.name;

      const found = serviceStations.find((s) => s.id === b.service_station_id);
      return found?.name || "—";
    },
    [serviceStations]
  );

  async function onSubmitForm(formValues) {
    if (!canManage) {
      setAlert({ type: "error", title: "Error", message: "You do not have permission" });
      return;
    }

    const payload = {
      ...formValues,
      service_station_id: formValues.service_station_id
        ? Number(formValues.service_station_id)
        : null,
    };

    try {
      if (editingId) {
        await api.put(`/api/branches/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ type: "success", title: "Success", message: "Branch updated successfully!" });
      } else {
        await api.post("/api/branches", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ type: "success", title: "Success", message: "Branch added successfully!" });
      }

      resetForm();
      setEditingId(null);
      setShowModal(false);
      setCurrentPage(1);
      fetchBranches();
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message:
          err.response?.data?.message ||
          `Failed to save branch (${err.response?.status || "unknown"})`,
      });
    }
  }

  const handleOpenForm = useCallback(() => {
    if (!canManage) return;
    setEditingId(null);
    resetForm();
    setShowModal(true);
  }, [canManage, resetForm]);

  const handleEdit = useCallback(
    (branch) => {
      if (!canManage) return;

      setEditingId(branch.id);

      safeSetFormValues({
        name: branch.name || "",
        manager_name: branch.manager_name || "",
        address: branch.address || "",
        contact: branch.contact || "",
        ext_no: branch.ext_no || "",
        service_station_id: branch.service_station_id ? String(branch.service_station_id) : "",
        region: branch.region || "",
      });

      setShowModal(true);
    },
    [canManage, safeSetFormValues]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!isAdmin) {
        setAlert({ type: "error", title: "Error", message: "Only admin can delete" });
        return;
      }

      if (!window.confirm("Are you sure you want to delete this branch?")) return;

      try {
        await api.delete(`/api/branches/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAlert({ type: "success", title: "Success", message: "Branch deleted successfully!" });

        // If last item removed, you may want to move one page back
        fetchBranches();
      } catch (err) {
        setAlert({
          type: "error",
          title: "Error",
          message:
            err.response?.data?.message ||
            `Failed to delete (${err.response?.status || "unknown"})`,
        });
      }
    },
    [isAdmin, token, fetchBranches]
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
    setEditingId(null);
  }, [resetForm]);

  const handleViewAssets = useCallback(
    (branch) => navigate(`/assets?branch=${encodeURIComponent(branch.name)}`),
    [navigate]
  );

  const handlePageChange = (page) => setCurrentPage(page);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (loading && branches.length === 0) {
    return (
      <>
        <main style={{background:'white'}} className="page-container">
          <div className="device-header">
            <h2>Branch Management</h2>
          </div>
          <SkeletonTable rows={5} cols={9} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main style={{background:'white'}} className="page-container">
        <div className="device-header">
          <h2>Branch Management</h2>
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
            placeholder="Search branches by name or address..."
            className="device-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {canManage && (
            <Button variant="primary" onClick={handleOpenForm}>
              + Add Branch
            </Button>
          )}
        </div>

        {/* Modal Form */}
        <Modal
          isOpen={showModal}
          title={editingId ? "Edit Branch" : "Add New Branch"}
          onClose={closeModal}
          actions={
            <div className="modal-actions">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>

              {/* ✅ real submit, no dispatchEvent */}
              <Button
                variant="primary"
                type="submit"
                form="branch-form"
                loading={isSubmitting}
              >
                {editingId ? "Update Branch" : "Add Branch"}
              </Button>
            </div>
          }
        >
          <form id="branch-form" className="branch-form" onSubmit={handleSubmit}>
            <FormInput
              label="Branch Name"
              name="name"
              placeholder="Enter branch name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              touched={touched.name}
              required
            />

            <FormInput
              label="Manager Name"
              name="manager_name"
              placeholder="Enter manager name"
              value={values.manager_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.manager_name}
              touched={touched.manager_name}
            />

            <FormInput
              label="Address"
              name="address"
              placeholder="Enter address"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.address}
              touched={touched.address}
            />

            <FormInput
              label="Contact Number"
              name="contact"
              placeholder="Enter contact number"
              value={values.contact}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.contact}
              touched={touched.contact}
              type="tel"
            />

            <FormInput
              label="Extension Number"
              name="ext_no"
              placeholder="Enter extension number"
              value={values.ext_no}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.ext_no}
              touched={touched.ext_no}
            />

            {/* Service station dropdown */}
            <div className="form-group">
              <label className="form-label">Service Station</label>
              <select
                className="form-control"
                name="service_station_id"
                value={values.service_station_id}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">-- Select Service Station --</option>
                {serviceStations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {touched.service_station_id && errors.service_station_id && (
                <small className="error-text">{errors.service_station_id}</small>
              )}
            </div>

            <FormInput
              label="Region"
              name="region"
              placeholder="Enter region"
              value={values.region}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.region}
              touched={touched.region}
            />
          </form>
        </Modal>

        {/* Table */}
        <div className="table-wrapper">
          {filteredBranches.length ? (
            <table className="device-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Branch Name</th>
                  <th>Manager</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Ext No.</th>
                  <th>Service Station</th>
                  <th>Region</th>
                  {canManage && <th>Actions</th>}
                  <th>Assets</th>
                </tr>
              </thead>

              <tbody>
                {filteredBranches.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>
                      <strong>{b.name}</strong>
                    </td>
                    <td>{b.manager_name || "—"}</td>
                    <td>{b.address || "—"}</td>
                    <td>{b.contact || "—"}</td>
                    <td>{b.ext_no || "—"}</td>
                    <td>{getStationName(b)}</td>
                    <td>{b.region || "—"}</td>

                    {canManage && (
                      <td className="action-cell">
                        <Button size="small" variant="primary" onClick={() => handleEdit(b)}>
                          Edit
                        </Button>

                        {isAdmin && (
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => handleDelete(b.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    )}

                    <td className="action-cell">
                      <Button size="small" variant="secondary" onClick={() => handleViewAssets(b)}>
                        Assets
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => navigate(`/branches/${b.id}`)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No branches found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredBranches.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={totalItems}
          />
        )}
      </main>

      <Footer />
    </>
  );
}
