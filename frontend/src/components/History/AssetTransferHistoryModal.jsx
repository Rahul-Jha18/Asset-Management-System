import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../services/api";

export default function AssetTransferHistoryModal({
  isOpen,
  onClose,
  assetId,
  assetCode,
  section,
  branchId,
  token,
}) {
  const [history, setHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  const branchName = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return "—";
      const found = branches.find((b) => Number(b.id) === Number(id));
      return found ? found.name : `Branch #${id}`;
    },
    [branches]
  );

  const fmt = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res?.data?.data || res?.data || []);
    } catch {
      // non-fatal
    }
  }, [token]);

    const fetchHistory = useCallback(async () => {
      if (!token || !assetId || !section) return;

      setLoading(true);
      setError(null);

      try {
        const offset = (page - 1) * PAGE_SIZE;

        const res = await api.get(
          `/api/assets/transfer-history?assetId=${assetId}&section=${encodeURIComponent(
            section
          )}&limit=${PAGE_SIZE}&offset=${offset}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res?.data?.data || [];
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load history"
        );
      } finally {
        setLoading(false);
      }
    }, [token, assetId, section, page]);
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setHistory([]);
      fetchBranches();
    }
  }, [isOpen, fetchBranches]);

  useEffect(() => {
    if (isOpen && assetId && section) {
      fetchHistory();
    }
  }, [isOpen, assetId, section, fetchHistory]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const totalPages = useMemo(() => {
    if (history.length < PAGE_SIZE) return Math.max(1, page);
    return page + 1;
  }, [history.length, page]);

  if (!isOpen) return null;

  const sectionColour = {
    desktop: "bg-cyan-50 text-cyan-700 border-cyan-200",
    laptop: "bg-indigo-50 text-indigo-700 border-indigo-200",
    printer: "bg-rose-50 text-rose-700 border-rose-200",
    scanner: "bg-orange-50 text-orange-700 border-orange-200",
    projector: "bg-emerald-50 text-emerald-700 border-emerald-200",
    panel: "bg-violet-50 text-violet-700 border-violet-200",
    ipphone: "bg-teal-50 text-teal-700 border-teal-200",
    cctv: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    server: "bg-sky-50 text-sky-700 border-sky-200",
    firewall_router: "bg-red-50 text-red-700 border-red-200",
    switch: "bg-lime-50 text-lime-700 border-lime-200",
    connectivity: "bg-blue-50 text-blue-700 border-blue-200",
    ups: "bg-yellow-50 text-yellow-700 border-yellow-200",
    inverter: "bg-orange-50 text-orange-700 border-orange-200",   // ── NEW ──
    extra_monitor: "bg-purple-50 text-purple-700 border-purple-200",
    default: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const secPill = sectionColour[String(section || "").toLowerCase()] || sectionColour.default;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#fff" }}
      >
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Transfer History</h2>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">
                    Branch, user, and combined transfer log
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold text-white">
                  Asset Code:&nbsp;
                  <span className="text-amber-300 ml-1">
                    {assetCode || assetId || "—"}
                  </span>
                </span>

                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${secPill}`}>
                  {section || "—"}
                </span>

                {branchId ? (
                  <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold text-slate-300">
                    Current Branch:&nbsp;
                    <span className="text-white ml-1">{branchName(branchId)}</span>
                  </span>
                ) : null}

                <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold text-slate-300">
                  {history.length} transfer{history.length !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/10 border border-white/20 hover:bg-rose-500/80 hover:border-rose-400 flex items-center justify-center transition-all duration-200 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-8 py-6">
          {error && (
            <div className="mb-4 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-semibold">
              ⚠ {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin" />
              <span className="text-slate-500 font-semibold text-sm">
                Loading transfer history…
              </span>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-slate-700 font-bold text-lg">No transfers recorded</p>
                <p className="text-slate-400 text-sm mt-1">
                  This asset has no saved transfer activity
                </p>
              </div>
            </div>
          )}

          {!loading && history.length > 0 && (
            <div className="relative">
              <div className="absolute left-[1.85rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-amber-200 to-transparent rounded-full pointer-events-none" />

              <div className="space-y-5">
                {history.map((record, idx) => {
                  const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;

                  const fromBranchId =
                    record.fromBranchId ?? record.from_branch_id ?? record.fromBranch;
                  const toBranchId =
                    record.toBranchId ?? record.to_branch_id ?? record.toBranch;

                  const from = branchName(fromBranchId);
                  const to = branchName(toBranchId);

                  const transferType = String(record.transferType || "branch").toLowerCase();
                  const by =
                    record.transferredBy ??
                    record.transferred_by ??
                    record.changedByName ??
                    "—";

                  const date = fmt(
                    record.createdAt ?? record.created_at ?? record.transferredAt
                  );

                  const reason =
                    record.reason ?? record.remarks ?? record.description ?? null;

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
                    <div key={record.id ?? idx} className="flex gap-4 items-start group">
                      <div className="relative flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-white shadow-md shadow-amber-200 flex items-center justify-center z-10 relative group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-[10px] font-black">{globalIdx}</span>
                        </div>
                      </div>

                      <div className="flex-1 rounded-2xl border-2 border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-black text-amber-700 uppercase tracking-wider">
                              Transfer
                            </span>

                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${secPill}`}>
                              {section}
                            </span>

                            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 uppercase">
                              {transferType}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400 font-semibold">{date}</span>
                        </div>

                        <div className="px-5 py-4 space-y-4">
                          {(transferType === "branch" || transferType === "both") && (
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex-1 min-w-[120px] rounded-xl border-2 border-rose-100 bg-rose-50 px-4 py-3">
                                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">
                                  From Branch
                                </div>
                                <div className="text-sm font-black text-rose-700 leading-tight">{from}</div>
                                {fromBranchId !== null && fromBranchId !== undefined && fromBranchId !== "" && (
                                  <div className="text-[10px] text-rose-400 font-semibold mt-0.5">
                                    <span className="text-rose-500 ml-1">ID: {fromBranchId}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </div>
                              </div>

                              <div className="flex-1 min-w-[120px] rounded-xl border-2 border-emerald-100 bg-emerald-50 px-4 py-3">
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                                  To Branch
                                </div>
                                <div className="text-sm font-black text-emerald-700 leading-tight">{to}</div>
                                {toBranchId !== null && toBranchId !== undefined && toBranchId !== "" && (
                                  <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                                    <span className="text-emerald-400 ml-1">ID: {toBranchId}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {(transferType === "user" || transferType === "both") && (
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex-1 min-w-[120px] rounded-xl border-2 border-violet-100 bg-violet-50 px-4 py-3">
                                <div className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1">
                                  From User
                                </div>
                                <div className="text-sm font-black text-violet-700 leading-tight">{fromUser || "—"}</div>
                              </div>

                              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-700 to-violet-900 flex items-center justify-center shadow-md">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </div>
                              </div>

                              <div className="flex-1 min-w-[120px] rounded-xl border-2 border-sky-100 bg-sky-50 px-4 py-3">
                                <div className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1">
                                  To User
                                </div>
                                <div className="text-sm font-black text-sky-700 leading-tight">{toUser || "—"}</div>
                              </div>
                            </div>
                          )}

                          {by && by !== "—" && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="text-xs text-slate-500">
                                Transferred by <span className="font-bold text-slate-700">{by}</span>
                              </span>
                            </div>
                          )}

                          {reason && (
                            <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                                Reason / Remarks
                              </div>
                              <p className="text-xs text-blue-800 leading-relaxed">{reason}</p>
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
        </div>

        <div className="flex-shrink-0 bg-white border-t-2 border-slate-100 px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-sm font-bold transition-all duration-200 active:scale-95"
            >
              ← Prev
            </button>

            <span className="px-3 py-2 text-sm font-bold text-slate-600">
              {page} / {Math.max(1, totalPages)}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || history.length < PAGE_SIZE}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-sm font-bold transition-all duration-200 active:scale-95"
            >
              Next →
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">
              {history.length} record{history.length !== 1 ? "s" : ""} on this page
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-bold rounded-xl hover:from-slate-900 hover:to-black shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}