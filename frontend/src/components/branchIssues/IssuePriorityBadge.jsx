import React from "react";

export default function IssuePriorityBadge({ priority = "Medium" }) {
  const normalized = String(priority || "Medium");

  const map = {
    Low: "it-priority it-priority-low",
    Medium: "it-priority it-priority-medium",
    High: "it-priority it-priority-high",
    Critical: "it-priority it-priority-critical",
  };

  return (
    <span className={map[normalized] || map.Medium}>
      <span className="it-priority-dot" />
      {normalized}
    </span>
  );
}