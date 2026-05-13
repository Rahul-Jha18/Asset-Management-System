// frontend/src/components/AssetHistoryTimeline.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Alert from "../common/Alert";

export default function AssetHistoryTimeline({ assetId, token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [assetId]);

  const fetchHistory = async () => {
    if (!assetId || !token) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/asset-history/asset/${assetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
      setAlert({ type: "error", message: "Failed to load asset history" });
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeColor = (changeType) => {
    switch (changeType) {
      case "CREATE":
        return "bg-green-50 border-green-200 text-green-700";
      case "UPDATE":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "DELETE":
        return "bg-red-50 border-red-200 text-red-700";
      case "TRANSFER":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "MAINTENANCE":
        return "bg-purple-50 border-purple-200 text-purple-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString();
  };

  const formatValue = (value) => {
    if (!value) return "(empty)";
    if (value.length > 100) return value.substring(0, 100) + "...";
    return value;
  };

  if (loading) {
    return <div className="p-4 text-slate-600">Loading asset history...</div>;
  }

  if (!history || history.length === 0) {
    return <div className="p-4 text-slate-600">No changes recorded for this asset</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4 text-slate-900">Asset Change History</h3>
      {alert && <Alert type={alert.type} message={alert.message} />}

      <div className="space-y-4">
        {history.map((record, idx) => (
          <div
            key={record.id || idx}
            className={`border-l-4 p-4 rounded-r-lg mb-3 ${getChangeTypeColor(
              record.changeType
            )}`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-sm">{record.changeType}</span>
                {record.fieldName && (
                  <span className="text-xs ml-2 font-semibold">
                    Field: {record.fieldName}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold">{formatDate(record.createdAt)}</span>
            </div>

            {/* Changed By */}
            {record.changedByName && (
              <div className="text-xs mb-2">
                <span className="font-semibold">Changed by:</span> {record.changedByName}
              </div>
            )}

            {/* Description */}
            {record.description && (
              <div className="text-sm mb-2">{record.description}</div>
            )}

            {/* Change Details */}
            {(record.oldValue || record.newValue) && (
              <div className="bg-white bg-opacity-40 p-2 rounded text-xs mt-2 space-y-1">
                {record.oldValue && (
                  <div>
                    <span className="font-semibold">From:</span>{" "}
                    <code className="bg-slate-100 px-1 rounded">
                      {formatValue(record.oldValue)}
                    </code>
                  </div>
                )}
                {record.newValue && (
                  <div>
                    <span className="font-semibold">To:</span>{" "}
                    <code className="bg-slate-100 px-1 rounded">
                      {formatValue(record.newValue)}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
