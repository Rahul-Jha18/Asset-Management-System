import React from "react";

const labelFor = (log) => {
  if (log.action === "StatusChanged") {
    return `${log.old_status || "Status"} → ${log.new_status || "Updated"}`;
  }

  const map = {
    Created: "Issue created",
    MessageAdded: "Message added",
    AttachmentAdded: "Attachment added",
    Assigned: "Assigned",
    Closed: "Closed",
    Reopened: "Reopened",
  };

  return map[log.action] || log.action || "Activity";
};

const timeFor = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-NP", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function IssueActivityLog({ logs = [] }) {
  if (!logs.length) {
    return <div className="it-muted-empty">No activity yet.</div>;
  }

  return (
    <div className="it-activity-compact">
      {logs.map((log) => (
        <div className="it-activity-mini" key={log.id}>
          <span className="it-activity-arrow">→</span>

          <div className="it-activity-mini-body">
            <div className="it-activity-mini-line">
              <strong>{labelFor(log)}</strong>
              <small>{timeFor(log.created_at)}</small>
            </div>

            {(log.actor_name || log.remarks) && (
              <p>
                {log.actor_name || "System"}
                {log.remarks ? ` · ${log.remarks}` : ""}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}