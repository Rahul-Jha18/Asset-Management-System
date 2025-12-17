// src/pages/Branch.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm, useDebounce } from '../hooks';
import api from '../services/api';
import Footer from '../components/Layout/Footer';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { LoadingSpinner, SkeletonTable } from '../components/Loading';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import '../styles/Pages.css';

export default function Branch() {
  const { token, isAdmin, isSubAdmin } = useAuth();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const canManage = isAdmin || isSubAdmin;

  // Form state
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, resetForm } = useForm(
    {
      name: '',
      manager_name: '',
      address: '',
      contact: '',
      ext_no: '',
      service_station: '',
      region: '',
    },
    onSubmitForm
  );

  // Fetch branches with pagination
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/branches', {
        params: { page: currentPage, limit: pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });
      // Extract paginated response
      const payload = res?.data?.data ?? [];
      const pagination = res?.data?.pagination ?? {};
      
      setBranches(Array.isArray(payload) ? payload : []);
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || 0);
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch branches',
      });
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize]);

  // Filter branches based on search (client-side after API fetch)
  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    b.address?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  useEffect(() => {
    if (!token) return;
    fetchBranches();
  }, [token, fetchBranches]);

  async function onSubmitForm(formValues) {
    if (!canManage) {
      setAlert({ type: 'error', title: 'Error', message: 'You do not have permission' });
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/branches/${editingId}`, formValues, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ type: 'success', title: 'Success', message: 'Branch updated successfully!' });
      } else {
        await api.post('/api/branches', formValues, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ type: 'success', title: 'Success', message: 'Branch added successfully!' });
      }

      resetForm();
      setEditingId(null);
      setShowModal(false);
      setCurrentPage(1); // Reset to first page after add/edit
      fetchBranches();
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to save branch',
      });
    }
  }

  const handleEdit = useCallback((branch) => {
    if (!canManage) return;
    setEditingId(branch.id);
    Object.keys(values).forEach((key) => {
      values[key] = branch[key] || '';
    });
    setShowModal(true);
  }, [canManage, values]);

  const handleDelete = useCallback(async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this branch?')) return;

    try {
      await api.delete(`/api/branches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ type: 'success', title: 'Success', message: 'Branch deleted successfully!' });
      fetchBranches();
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete branch',
      });
    }
  }, [isAdmin, token, fetchBranches]);

  const handleViewAssets = useCallback((branch) => {
    navigate(`/assets?branch=${encodeURIComponent(branch.name)}`);
  }, [navigate]);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading && branches.length === 0) {
    return (
      <>
        <main className="page-container">
          <div className="device-header">
            <h2>Branch Management</h2>
          </div>
          <SkeletonTable rows={5} cols={8} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="page-container">
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
            <Button
              variant="primary"
              onClick={handleOpenForm}
            >
              + Add Branch
            </Button>
          )}
        </div>

        {/* Modal Form */}
        <Modal
          isOpen={showModal}
          title={editingId ? 'Edit Branch' : 'Add New Branch'}
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
                onClick={() => document.querySelector('.branch-form').dispatchEvent(new Event('submit', { bubbles: true }))}
              >
                {editingId ? 'Update Branch' : 'Add Branch'}
              </Button>
            </div>
          }
        >
          <form className="branch-form" onSubmit={handleSubmit}>
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
            <FormInput
              label="Service Station"
              name="service_station"
              placeholder="Enter service station"
              value={values.service_station}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.service_station}
              touched={touched.service_station}
            />
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
                    <td><strong>{b.name}</strong></td>
                    <td>{b.manager_name || '—'}</td>
                    <td>{b.address || '—'}</td>
                    <td>{b.contact || '—'}</td>
                    <td>{b.ext_no || '—'}</td>
                    <td>{b.service_station || '—'}</td>
                    <td>{b.region || '—'}</td>

                    {canManage && (
                      <td className="action-cell">
                        <Button
                          size="small"
                          variant="primary"
                          onClick={() => handleEdit(b)}
                        >
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
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleViewAssets(b)}
                      >
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
          />
        )}
      </main>
      <Footer />
    </>
  );
}
