import React from "react";
import { deleteBranchIssue } from "../../services/branchIssueApi";
import IssueStatusBadge from "./IssueStatusBadge";
import IssuePriorityBadge from "./IssuePriorityBadge";

const initials = (name = "") =>
  String(name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export default function IssueTable({
  issues = [],
  loading = false,
  canAct = false,
  onRowClick,
  onRefresh,
  page = 1,
  rowsPerPage = 10,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(issues.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentRows = issues.slice(start, start + rowsPerPage);

  const handleDelete = async (e, issue) => {
    e.stopPropagation();

    if (!window.confirm("Delete this issue? Only open issues can be deleted.")) return;

    try {
      await deleteBranchIssue(issue.id);
      if (onRefresh) onRefresh();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete issue");
    }
  };

  return (
    <div className="it-table-card">
      <div className="it-table-head">
        <div>
          <h3>{canAct ? "All Branch Issues" : "My Branch Issues"}</h3>
          <p>Modern tracker view with clean rows, priority badges, status flow and quick actions.</p>
        </div>

        <div className="it-table-tools">
          <span className="it-table-role-pill">{canAct ? "Admin / Corp View" : "Branch View"}</span>
        </div>
      </div>

      {loading ? (
        <div className="it-empty-state">
          <div className="it-spinner" />
          <strong>Loading issues...</strong>
        </div>
      ) : issues.length === 0 ? (
        <div className="it-empty-state">
          <div className="it-empty-icon">📭</div>
          <strong>No issues found</strong>
          <span>Try adjusting filters or submit a new issue.</span>
        </div>
      ) : (
        <>
          <div className="it-table-scroll">
            <table className="it-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Issue Summary</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentRows.map((issue) => (
                  <tr key={issue.id} onClick={() => onRowClick && onRowClick(issue.id)}>
                    <td>
                      <span className="it-ticket">{issue.ticket_no}</span>
                    </td>

                    <td>
                      <div className="it-title-cell" title={issue.title}>{issue.title}</div>
                      <div className="it-desc-cell" title={issue.description}>{issue.description}</div>
                    </td>

                    <td>
                      <span className="it-category-cell">
                        ▦ {issue.category?.name || issue.category_name || "—"}
                      </span>
                    </td>

                    <td>
                      <IssuePriorityBadge priority={issue.priority} />
                    </td>

                    <td>
                      <IssueStatusBadge status={issue.status} />
                    </td>

                    <td>
                      <div className="it-reporter">
                        <span className="it-avatar">{initials(issue.reporter_name || issue.reporter_email)}</span>
                        <div>
                          <strong>{issue.reporter_name || issue.reporter_email || "—"}</strong>
                          <small>{issue.branch_name || issue.reporter_branch || issue.reporter_branch_name || ""}</small>
                        </div>
                      </div>
                    </td>

                    <td>{formatDate(issue.created_at)}</td>

                    <td>
                      <div className="it-row-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="it-table-view"
                          onClick={() => onRowClick && onRowClick(issue.id)}
                        >
                          View
                        </button>

                        {issue.status === "Open" && (
                          <button
                            type="button"
                            className="it-table-delete"
                            onClick={(e) => handleDelete(e, issue)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="it-table-footer">
            <span>
              Showing {start + 1} to {Math.min(start + rowsPerPage, issues.length)} of {issues.length} issues
            </span>

            <div className="it-pagination">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => onPageChange && onPageChange(safePage - 1)}
              >
                ‹
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  type="button"
                  key={p}
                  className={safePage === p ? "active" : ""}
                  onClick={() => onPageChange && onPageChange(p)}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => onPageChange && onPageChange(safePage + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
