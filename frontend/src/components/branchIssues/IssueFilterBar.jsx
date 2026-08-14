import React from "react";

const SearchIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const FilterIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M6.75 12h10.5M10 19.5h4" />
  </svg>
);

export default function IssueFilterBar({
  search,
  onSearch,
  statusF,
  onStatus,
  priorityF,
  onPriority,
  categoryF,
  onCategory,
  categories = [],
  onClear,
  activeFilters = 0,
  total = 0,
}) {
  return (
    <div className="it-filter-card">
      <div className="it-filter-search">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search title, ticket no, reporter or branch..."
        />
        <kbd>⌘ K</kbd>
      </div>

      <select className="it-filter-select" value={statusF} onChange={(e) => onStatus(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="UnderReview">Under Review</option>
        <option value="Closed">Closed</option>
      </select>

      <select className="it-filter-select" value={priorityF} onChange={(e) => onPriority(e.target.value)}>
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>

      <select className="it-filter-select" value={categoryF} onChange={(e) => onCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {activeFilters > 0 && (
        <button type="button" className="it-clear-btn" onClick={onClear}>
          Clear
        </button>
      )}

      <button type="button" className="it-filter-action" aria-label="Filters">
        <FilterIcon />
        Filters
        <span>{activeFilters}</span>
      </button>

      <span className="it-count-pill">{total} issue{total === 1 ? "" : "s"}</span>
    </div>
  );
}
