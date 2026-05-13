import React, { useState, useMemo } from "react";
import Select from "react-select";
import api from "../../services/api";
import Alert from "../common/Alert";

export default function AddSubCategoryModal({ isOpen, onClose, onSuccess, token, groups }) {
  const [formData, setFormData] = useState({ code: "", groupId: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const groupOptions = useMemo(
    () => groups.map((g) => ({ value: g.id, label: `${g.name} (${g.id})` })),
    [groups]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupChange = (selected) => {
    setFormData((prev) => ({ ...prev, groupId: selected ? selected.value : "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Validation
    if (!formData.code.trim() || !formData.groupId || !formData.name.trim()) {
      setAlert({
        type: "error",
        message: "Code, Category, and Name are required",
      });
      return;
    }

    if (formData.code.trim().length > 5) {
      setAlert({ type: "error", message: "Code must not exceed 5 characters" });
      return;
    }

    if (formData.name.trim().length > 100) {
      setAlert({ type: "error", message: "Name must not exceed 100 characters" });
      return;
    }

    try {
      setLoading(true);
      await api.post(
        "/api/asset-sub-categories",
        {
          code: formData.code.trim().toUpperCase(),
          groupId: formData.groupId.toUpperCase(),
          name: formData.name.trim().toUpperCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ type: "success", message: "Sub-category created successfully!" });
      setFormData({ code: "", groupId: "", name: "" });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to create sub-category";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedGroup = formData.groupId
    ? groupOptions.find((g) => g.value === formData.groupId)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Add New Sub-Category</h2>

        {alert && <Alert type={alert.type} message={alert.message} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <Select
              options={groupOptions}
              value={selectedGroup}
              onChange={handleGroupChange}
              placeholder="Select a category"
              isDisabled={loading}
              className="text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Select the parent category for this sub-category
            </p>
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sub-Category Code <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., DES, LAP, PRT"
              maxLength="5"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              disabled={loading}
              required
            />
            <p className="text-xs text-slate-500 mt-1">1-5 characters (alphanumeric)</p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sub-Category Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Desktop Computer, Laptop"
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Sub-Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
