import React, { useMemo, useState } from "react";
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

const stripHtml = (html = "") => {
  if (typeof document === "undefined") {
    return String(html || "").replace(/<[^>]*>/g, "");
  }

  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const BASKETS = [
  {
    key: "new",
    title: "New Reports",
    sub: "New open reports assigned or waiting for action",
    tone: "red",
  },
  {
    key: "Open",
    title: "Open",
    sub: "Reports waiting for action",
    tone: "green",
  },
  {
    key: "UnderReview",
    title: "Under Review",
    sub: "Reports currently being checked",
    tone: "blue",
  },
  {
    key: "Closed",
    title: "Closed",
    sub: "Resolved and closed reports",
    tone: "slate",
  },
  {
    key: "high",
    title: "High / Critical",
    sub: "Priority reports needing faster attention",
    tone: "amber",
  },
];

function MiniIssueTable({
  rows,
  canDelete,
  onRowClick,
  onDelete,
  page,
  rowsPerPage,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentRows = rows.slice(start, start + rowsPerPage);

  return (
    <div className="it-table-card">
      {rows.length === 0 ? (
        <div className="it-empty-state">
          <div className="it-empty-icon">📭</div>
          <strong>No issues found in this basket</strong>
          <span>Try another basket or submit a new issue.</span>
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
                      <div className="it-title-cell" title={issue.title}>
                        {issue.title}
                      </div>
                      <div className="it-desc-cell" title={stripHtml(issue.description)}>
                        {stripHtml(issue.description)}
                      </div>
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
                        <span className="it-avatar">
                          {initials(issue.reporter_name || issue.reporter_email)}
                        </span>
                        <div>
                          <strong>{issue.reporter_name || issue.reporter_email || "—"}</strong>
                          <small>
                            {issue.branch_name ||
                              issue.reporter_branch ||
                              issue.reporter_branch_name ||
                              ""}
                          </small>
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

                        {canDelete && issue.status === "Open" && (
                          <button
                            type="button"
                            className="it-table-delete"
                            onClick={(e) => onDelete(e, issue)}
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
              Showing {start + 1} to {Math.min(start + rowsPerPage, rows.length)} of{" "}
              {rows.length} issues
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

export default function IssueTable({
  issues = [],
  loading = false,
  canAct = false,
  canDelete = false,
  currentUser,
  activeBasket = "all",
  newReportCount = 0,
  isCorpUser = false,
  onBasketChange,
  onRowClick,
  onRefresh,
  page = 1,
  rowsPerPage = 10,
  onPageChange,
}) {
  const [localOpenBasket, setLocalOpenBasket] = useState(activeBasket || "all");
  const openBasket = activeBasket || localOpenBasket;

  const basketRows = useMemo(() => {
    const getRows = (key) => {
      if (key === "all") return issues;

      if (key === "new") {
        return issues.filter((issue) => {
          if (issue.status !== "Open") return false;

          if (isCorpUser) {
            return String(issue.assigned_to_user_id || "") === String(currentUser?.id || "");
          }

          return true;
        });
      }

      if (key === "high") {
        return issues.filter((issue) => ["High", "Critical"].includes(issue.priority));
      }

      return issues.filter((issue) => issue.status === key);
    };

    return BASKETS.reduce((acc, basket) => {
      acc[basket.key] = getRows(basket.key);
      return acc;
    }, {});
  }, [issues, isCorpUser, currentUser?.id]);

  const handleBasketClick = (basketKey) => {
    const nextBasket = openBasket === basketKey ? "all" : basketKey;
    setLocalOpenBasket(nextBasket);

    if (onBasketChange) {
      onBasketChange(nextBasket);
    }

    if (onPageChange) {
      onPageChange(1);
    }
  };

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

  if (loading) {
    return (
      <div className="it-basket-shell">
        <div className="it-empty-state">
          <div className="it-spinner" />
          <strong>Loading issues...</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="it-basket-shell">
      <div className="it-basket-shell-head">
        <div>
          <h3>Table Format [Basket]</h3> 
          <p>Click New Reports, Open, Under Review, Closed, or any basket to open its table.</p>
        </div>

        <div className="it-table-tools">
          <span className="it-basket-shell-pill">
            {BASKETS.length} baskets
          </span>
          <span className="it-table-role-pill">
            {canAct ? "Admin / Corp View" : "Branch View"}
          </span>
        </div>
      </div>

      <div className="it-basket-list">
        {BASKETS.map((basket) => {
          const rows = basketRows[basket.key] || [];
          const isOpen = openBasket === basket.key;
          const showBlink = basket.key === "new" && Number(newReportCount || rows.length || 0) > 0;

          return (
            <div
              className={`it-basket-row it-basket-${basket.tone} ${
                isOpen ? "it-basket-row-open" : ""
              }`}
              key={basket.key}
            >
              <button
                type="button"
                className="it-basket-button"
                onClick={() => handleBasketClick(basket.key)}
              >
                <div className="it-basket-left">
                  <span className="it-basket-dot2" />
                  <span className="it-basket-title">
                    <strong>{basket.title}</strong>
                    <span className="it-basket-sub">{basket.sub}</span>
                  </span>
                </div>

                <div className="it-basket-right">
                  {showBlink ? (
                    <span className="it-basket-new-badge">
                      {Number(newReportCount || rows.length).toLocaleString()}
                    </span>
                  ) : (
                    <span className="it-basket-count-badge">
                      {rows.length.toLocaleString()}
                    </span>
                  )}

                  <span className="it-basket-arrow">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="it-basket-panel">
                  <MiniIssueTable
                    rows={rows}
                    canDelete={canDelete}
                    onRowClick={onRowClick}
                    onDelete={handleDelete}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={onPageChange}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
