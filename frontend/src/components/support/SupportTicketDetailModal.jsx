import React, { useEffect, useMemo, useState } from "react";
import {
  getSupportTicketById,
  replySupportTicket,
  updateSupportTicketStatus,
  assignSupportTicket,
  forwardSupportTicket,
} from "../../services/supportApi";

const STATUS_OPTIONS = ["Open", "In Progress", "Forwarded", "Resolved", "Closed"];
const ROLE_OPTIONS = ["support", "subadmin", "admin"];

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Open: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "In Progress": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Forwarded: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    Resolved: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    Closed: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${map[status] || map.Closed}`}>
      {status || "Open"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    Low: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    Medium: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    High: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Critical: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${map[priority] || map.Medium}`}>
      {priority || "Medium"}
    </span>
  );
}

export default function SupportTicketDetailModal({
  ticketId,
  user,
  isOpen,
  onClose,
  onChanged,
}) {
  const role = String(user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
  const isAdmin = role === "admin";
  const isSubAdmin = role === "subadmin";
  const isSupport = role === "support";
  const isStaff = isAdmin || isSubAdmin || isSupport;

  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [forwardRemark, setForwardRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Open");
  const [assignedRole, setAssignedRole] = useState("subadmin");

  const loadTicket = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const res = await getSupportTicketById(ticketId);
      const t = res?.data?.ticket;
      setTicket(t || null);
      setReplies(res?.data?.replies || []);
      setStatus(t?.status || "Open");
      setAssignedRole(t?.assigned_to_role || "subadmin");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) loadTicket();
  }, [isOpen, ticketId]);

  const sameBranch =
    String(user?.branch_id || "") === String(ticket?.branch_id || "");

  const isForwarded =
    ticket?.status === "Forwarded" || ticket?.assigned_to_role === "admin";

  const canSubAdminAct = isSubAdmin && sameBranch;
  const canAdminOrSupportAct = (isAdmin || isSupport) && isForwarded;

  const canReply = canSubAdminAct || canAdminOrSupportAct;
  const canUpdateStatus = canSubAdminAct || canAdminOrSupportAct;
  const canAssign = canAdminOrSupportAct;
  const canForward = canSubAdminAct && !isForwarded;

  const infoMessage = useMemo(() => {
    if ((isAdmin || isSupport) && !isForwarded) {
      return "Admin/Support can view this ticket, but actions are locked until the branch sub-admin forwards it.";
    }
    if (isSubAdmin && !sameBranch) {
      return "You can only act on tickets from your own branch.";
    }
    return "";
  }, [isAdmin, isSupport, isSubAdmin, isForwarded, sameBranch]);

  const sendReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSaving(true);
      await replySupportTicket(ticket.id, replyText.trim());
      setReplyText("");
      await loadTicket();
      onChanged?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Reply failed");
    } finally {
      setSaving(false);
    }
  };

  const updateStatusNow = async () => {
    try {
      setSaving(true);
      await updateSupportTicketStatus(ticket.id, status);
      await loadTicket();
      onChanged?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Status update failed");
    } finally {
      setSaving(false);
    }
  };

  const assignRoleNow = async () => {
    try {
      setSaving(true);
      await assignSupportTicket(ticket.id, assignedRole);
      await loadTicket();
      onChanged?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Assign failed");
    } finally {
      setSaving(false);
    }
  };

  const forwardNow = async () => {
    if (!forwardRemark.trim()) {
      alert("Forward remark is required");
      return;
    }

    try {
      setSaving(true);
      await forwardSupportTicket(ticket.id, forwardRemark.trim());
      setForwardRemark("");
      await loadTicket();
      onChanged?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Forward failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-700 via-blue-600 to-rose-600 px-5 py-4 text-white sm:px-6">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              Ticket #{ticket?.id || ticketId}
            </div>
            <h2 className="truncate text-xl font-extrabold">
              {ticket?.subject || "Support Ticket"}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={ticket?.status} />
              <PriorityBadge priority={ticket?.priority} />
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            </div>
          ) : !ticket ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-700">
              Ticket could not be loaded.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-extrabold text-slate-900">Ticket Details</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Full request information and routing details.
                    </p>
                  </div>

                  <div className="grid gap-3 p-5 sm:grid-cols-2">
                    <Field label="Name" value={ticket.name} />
                    <Field label="Email" value={ticket.email} />
                    <Field label="Contact" value={ticket.contact_no} />
                    <Field label="Branch" value={ticket.branch_name} />
                    <Field label="Type" value={ticket.type} />
                    <Field label="Category" value={ticket.category} />
                    <Field label="Sub Category" value={ticket.sub_category} />
                    <Field label="Asset ID" value={ticket.asset_id} />
                    <Field label="Asset Label" value={ticket.asset_label} />
                    <Field label="Issue Type" value={ticket.issue_type} />
                    <Field label="Assigned To" value={ticket.assigned_to_role} />
                    <Field label="Location Note" value={ticket.location_note} />
                    <div className="sm:col-span-2">
                      <Field label="Requested Change" value={ticket.requested_change} />
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Message" value={ticket.message} />
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Forward Remark" value={ticket.forwarded_remark} />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-extrabold text-slate-900">Replies</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Conversation history for this ticket.
                    </p>
                  </div>

                  <div className="p-5">
                    {replies.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
                        No replies yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {replies.map((r) => {
                          const sender = String(r.sender_role || "").toLowerCase();
                          const bubbleClass =
                            sender === "admin"
                              ? "bg-blue-50 border-blue-200"
                              : sender === "support"
                              ? "bg-violet-50 border-violet-200"
                              : sender === "subadmin"
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-slate-50 border-slate-200";

                          return (
                            <div
                              key={r.id}
                              className={`rounded-2xl border p-4 ${bubbleClass}`}
                            >
                              <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-600">
                                {sender || "user"}
                              </div>
                              <div className="whitespace-pre-wrap text-sm text-slate-800">
                                {r.message}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-extrabold text-slate-900">Staff Actions</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Routing and response controls.
                    </p>
                  </div>

                  <div className="space-y-5 p-5">
                    {isStaff && infoMessage && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                        {infoMessage}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none ring-0 transition focus:border-blue-500"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={!canUpdateStatus || saving}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={updateStatusNow}
                        disabled={!canUpdateStatus || saving}
                        className="mt-3 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save Status
                      </button>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Assign Role
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500"
                        value={assignedRole}
                        onChange={(e) => setAssignedRole(e.target.value)}
                        disabled={!canAssign || saving}
                      >
                        {ROLE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={assignRoleNow}
                        disabled={!canAssign || saving}
                        className="mt-3 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save Assignment
                      </button>
                    </div>

                    {canForward && (
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Forward Remark
                        </label>
                        <textarea
                          rows={4}
                          value={forwardRemark}
                          onChange={(e) => setForwardRemark(e.target.value)}
                          placeholder="Add remark before forwarding to admin..."
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
                        />
                        <button
                          onClick={forwardNow}
                          disabled={saving}
                          className="mt-3 w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Forward to Admin
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Reply
                      </label>
                      <textarea
                        rows={5}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={!canReply || saving}
                        placeholder={
                          canReply
                            ? "Write your reply..."
                            : "Reply is locked until sub-admin forwards this ticket"
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                      />
                      <button
                        onClick={sendReply}
                        disabled={!canReply || saving}
                        className="mt-3 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-rose-50 p-5 shadow-sm">
                  <div className="text-sm font-extrabold text-slate-900">Routing Rule</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    New tickets start at <span className="font-bold">subadmin</span>. Admin and
                    support can view immediately, but action is unlocked only after the sub-admin
                    forwards the ticket.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}