import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import Alert from "../common/Alert";

export default function AssetHistoryModal({
  isOpen,
  onClose,
  assetId,
  branchId,
  token,
  filterByChangeType = null,
  useTransfersTable = false,
  section = null,
}) {
  const [history, setHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10;

  const branchName = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return "—";
      const found = branches.find((b) => Number(b.id) === Number(id));
      return found ? found.name : `Branch #${id}`;
    },
    [branches]
  );

  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res?.data?.data || res?.data || []);
    } catch {
      // silent
    }
  }, [token]);

  const fetchHistory = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setAlert(null);

    try {
      let res;

      if (useTransfersTable) {
        const offset = (currentPage - 1) * PAGE_SIZE;
        let url = `/api/asset-transfers/history?limit=${PAGE_SIZE}&offset=${offset}`;

        if (assetId) {
          url += `&assetId=${assetId}`;
        }
        if (section) {
          url += `&section=${encodeURIComponent(section)}`;
        }

        res = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (branchId && assetId) {
        res = await api.get(
          `/api/asset-history/asset/${assetId}?branchId=${branchId}&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      let data = res?.data?.data?.transfers || res?.data?.data || [];

      if (filterByChangeType && !useTransfersTable) {
        data = data.filter((r) => r.changeType === filterByChangeType);
      }

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load transfer history",
      });
    } finally {
      setLoading(false);
    }
  }, [
    token,
    branchId,
    assetId,
    filterByChangeType,
    useTransfersTable,
    currentPage,
    section,
  ]);

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
      fetchHistory();
    }
  }, [isOpen, fetchBranches, fetchHistory]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString();
    } catch {
      return "—";
    }
  };

  const typeBadgeClass = (type) => {
    const v = String(type || "branch").toLowerCase();
    if (v === "user") return "bg-violet-100 text-violet-700";
    if (v === "both") return "bg-indigo-100 text-indigo-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-white">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Transfer History</h2>
              <p className="text-slate-400 text-sm mt-1">
                Complete branch, user, and combined transfer log
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 hover:bg-rose-500 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gradient-to-b from-slate-50 to-white">
          {alert && <Alert type={alert.type} message={alert.message} />}

          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 mt-3 text-sm">
                Loading transfer history...
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-semibold">
              No transfer records found
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-transparent" />

              <div className="space-y-6">
                {history.map((record, index) => {
                  const fromId =
                    record.fromBranchId ??
                    record.from_branch_id ??
                    record.fromBranch;

                  const toId =
                    record.toBranchId ??
                    record.to_branch_id ??
                    record.toBranch;

                  const from = branchName(fromId);
                  const to = branchName(toId);

                  const transferType = String(record.transferType || "branch").toLowerCase();

                  const fromUser =
                    record.fromUserName ??
                    record.from_user_name ??
                    record.fromUser ??
                    "—";

                  const toUser =
                    record.toUserName ??
                    record.to_user_name ??
                    record.toUser ??
                    "—";

                  return (
                    <div key={record.id || index} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shadow-lg z-10">
                        {index + 1}
                      </div>

                      <div className="flex-1 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-3 bg-slate-50 border-b flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                              TRANSFER
                            </span>

                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${typeBadgeClass(
                                transferType
                              )}`}
                            >
                              {transferType.toUpperCase()}
                            </span>

                            {record.section ? (
                              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full uppercase">
                                {record.section}
                              </span>
                            ) : null}
                          </div>

                          <span className="text-xs text-slate-500 font-semibold">
                            {formatDate(record.createdAt || record.created_at)}
                          </span>
                        </div>

                        <div className="p-5 space-y-4">
                          <div>
                            <span className="text-xs text-slate-500">Asset Code:</span>
                            <span className="ml-2 font-bold text-indigo-700">
                              {record.assetCode || "—"}
                            </span>
                          </div>

                          {(transferType === "branch" || transferType === "both") && (
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex-1 min-w-[120px] bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
                                <div className="text-xs font-black text-rose-500 uppercase mb-1">
                                  From Branch
                                </div>
                                <div className="text-sm font-bold text-rose-700">
                                  {from}
                                </div>
                                {fromId !== null && fromId !== undefined && fromId !== "" && (
                                  <div className="text-[10px] text-rose-400 mt-1">
                                    ID: {fromId}
                                  </div>
                                )}
                              </div>

                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                                →
                              </div>

                              <div className="flex-1 min-w-[120px] bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                                <div className="text-xs font-black text-emerald-500 uppercase mb-1">
                                  To Branch
                                </div>
                                <div className="text-sm font-bold text-emerald-700">
                                  {to}
                                </div>
                                {toId !== null && toId !== undefined && toId !== "" && (
                                  <div className="text-[10px] text-emerald-400 mt-1">
                                    ID: {toId}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {(transferType === "user" || transferType === "both") && (
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex-1 min-w-[120px] bg-violet-50 border-2 border-violet-200 rounded-xl p-4">
                                <div className="text-xs font-black text-violet-500 uppercase mb-1">
                                  From User
                                </div>
                                <div className="text-sm font-bold text-violet-700">
                                  {fromUser || "—"}
                                </div>
                              </div>

                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                                →
                              </div>

                              <div className="flex-1 min-w-[120px] bg-sky-50 border-2 border-sky-200 rounded-xl p-4">
                                <div className="text-xs font-black text-sky-500 uppercase mb-1">
                                  To User
                                </div>
                                <div className="text-sm font-bold text-sky-700">
                                  {toUser || "—"}
                                </div>
                              </div>
                            </div>
                          )}

                          {record.transferredBy && (
                            <div className="text-sm text-slate-600">
                              Transferred by{" "}
                              <span className="font-bold text-slate-800">
                                {record.transferredBy}
                              </span>
                            </div>
                          )}

                          {(record.reason || record.remarks) && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
                              <strong>Reason:</strong> {record.reason || record.remarks}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {useTransfersTable && history.length > 0 && (
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 disabled:opacity-40"
              >
                ← Prev
              </button>

              <span className="px-4 py-2 font-semibold text-slate-700">
                Page {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={history.length < PAGE_SIZE}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}