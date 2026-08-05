import React from "react";

const ACTION_META = {
  Created:          { label: "Issue created",    tone: "green" },
  StatusChanged:    { label: null,                tone: "amber" },
  MessageAdded:     { label: "Message added",     tone: "blue" },
  AttachmentAdded:  { label: "Attachment added",  tone: "violet" },
  Assigned:         { label: "Assigned",          tone: "blue" },
  Closed:           { label: "Closed",            tone: "slate" },
  Reopened:         { label: "Reopened",          tone: "green" },
};

const metaFor = (log) => ACTION_META[log.action] || { label: log.action || "Activity", tone: "slate" };

const labelFor = (log) => {
  if (log.action === "StatusChanged") {
    return `${log.old_status || "Status"} → ${log.new_status || "Updated"}`;
  }
  return metaFor(log).label || log.action || "Activity";
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
    return (
      <div className="it-muted-empty">
        <span className="it-timeline-empty-glyph" aria-hidden="true" />
        No activity yet.
      </div>
    );
  }

  return (
    <div className="it-activity-compact">
      {logs.map((log) => {
        const meta = metaFor(log);

        return (
          <div className={`it-activity-mini it-activity-${meta.tone}`} key={log.id}>
            <span className="it-activity-dot" />

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
        );
      })}
    </div>
  );
}