import React, { useState } from "react";
import api from "../../services/api";
import Alert from "../common/Alert";

export default function AddCategoryModal({ isOpen, onClose, onSuccess, token }) {
  const [formData, setFormData] = useState({ id: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Validation
    if (!formData.id.trim() || !formData.name.trim()) {
      setAlert({ type: "error", message: "Both ID and Name are required" });
      return;
    }

    if (formData.id.trim().length !== 1) {
      setAlert({ type: "error", message: "ID must be a single character (A-Z)" });
      return;
    }

    if (!/^[a-zA-Z]$/.test(formData.id.trim())) {
      setAlert({ type: "error", message: "ID must be a letter (A-Z)" });
      return;
    }

    if (formData.name.trim().length > 100) {
      setAlert({ type: "error", message: "Name must not exceed 100 characters" });
      return;
    }

    try {
      setLoading(true);
      await api.post(
        "/api/asset-groups",
        {
          id: formData.id.trim().toUpperCase(),
          name: formData.name.trim().toUpperCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ type: "success", message: "Category created successfully!" });
      setFormData({ id: "", name: "" });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to create category";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Add New Category</h2>

        {alert && <Alert type={alert.type} message={alert.message} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="e.g., H, I, L, S, C"
              maxLength="1"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
            <p className="text-xs text-slate-500 mt-1">Single uppercase letter (A-Z)</p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Hardware, Infrastructure"
              maxLength="100"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
