// frontend/src/pages/BranchHistoryPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Alert from "../components/Alert";

export default function BranchHistoryPage() {
  const { token } = useAuth();
  const { branchId } = useParams();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    assetType: "",
    changeType: "",
    page: 1,
    limit: 50,
  });

  const fetchHistory = useCallback(async () => {
    if (!token || !branchId) return;
    setLoading(true);
    try {
      let query = `/api/asset-history/branch/${branchId}`;
      const params = [];
      if (filters.assetType) params.push(`assetType=${filters.assetType}`);
      params.push(`limit=${filters.limit}`);
      if (params.length) query += "?" + params.join("&");

      const res = await api.get(query, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setHistory(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
      setAlert({ type: "error", message: "Failed to load branch history" });
    } finally {
      setLoading(false);
    }
  }, [token, branchId, filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getChangeTypeColor = (changeType) => {
    const colors = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      TRANSFER: "bg-amber-100 text-amber-800",
      MAINTENANCE: "bg-purple-100 text-purple-800",
    };
    return colors[changeType] || "bg-slate-100 text-slate-800";
  };

  const getAssetTypeColor = (assetType) => {
    const colors = {
      laptop: "bg-indigo-100 text-indigo-800",
      desktop: "bg-cyan-100 text-cyan-800",
      printer: "bg-rose-100 text-rose-800",
      scanner: "bg-orange-100 text-orange-800",
      projector: "bg-emerald-100 text-emerald-800",
      panel: "bg-violet-100 text-violet-800",
      ipphone: "bg-teal-100 text-teal-800",
      cctv: "bg-fuchsia-100 text-fuchsia-800",
      connectivity: "bg-lime-100 text-lime-800",
      ups: "bg-pink-100 text-pink-800",
    };
    return colors[assetType] || "bg-slate-100 text-slate-800";
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString();
  };

  const formatValue = (value) => {
    if (!value) return "(empty)";
    try {
      if (value.length > 100) return value.substring(0, 100) + "...";
      return value;
    } catch {
      return String(value);
    }
  };

  if (!token) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-rose-600">Unauthorized</h2>
        <p className="text-slate-600">Please sign in to view branch history.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-slate-600">Loading branch history...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Branch History</h1>
          <p className="text-slate-600">View all changes made in this branch</p>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} />}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Asset Type Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Asset Type
              </label>
              <select
                value={filters.assetType}
                onChange={(e) =>
                  setFilters({ ...filters, assetType: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
                <option value="printer">Printer</option>
                <option value="scanner">Scanner</option>
                <option value="projector">Projector</option>
                <option value="panel">Panel</option>
                <option value="ipphone">IP Phone</option>
                <option value="cctv">CCTV</option>
              </select>
            </div>
            {/* Limit */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Records per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters({ ...filters, limit: Number(e.target.value), page: 1 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchHistory}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-600">No history records found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Asset Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Asset ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Change Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Field
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Changed By
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {history.map((record, idx) => (
                  <tr key={record.id || idx} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getAssetTypeColor(
                          record.assetType
                        )}`}
                      >
                        {record.assetType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {record.assetId}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getChangeTypeColor(
                          record.changeType
                        )}`}
                      >
                        {record.changeType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {record.fieldName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {record.changedByName || "System"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div title={record.description}>{formatValue(record.description)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Summary */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Total Records:</span> {history.length} | Last Updated:{" "}
            {history.length > 0
              ? formatDate(history[0].createdAt)
              : "No records"}
          </p>
        </div>
      </div>
    </div>
  );
}
