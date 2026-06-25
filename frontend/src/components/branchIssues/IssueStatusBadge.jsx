import React from "react";

export default function IssueStatusBadge({ status = "Open" }) {
  const normalized = String(status || "Open");

  const map = {
    Open: {
      label: "Open",
      className: "it-status it-status-open",
    },
    UnderReview: {
      label: "Under Review",
      className: "it-status it-status-review",
    },
    Closed: {
      label: "Closed",
      className: "it-status it-status-closed",
    },
  };

  const item = map[normalized] || map.Open;

  return (
    <span className={item.className}>
      <span className="it-status-dot" />
      {item.label}
    </span>
  );
}
