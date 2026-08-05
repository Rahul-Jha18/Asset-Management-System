import api from "./api";

/* Categories */
export const getIssueCategories = (params = {}) =>
  api.get("/api/v1/branch-issues/categories", { params });

// Kept old function name for compatibility.
// Backend now returns all users from the User table, not only corporate users.
export const getIssueCorpUsers = () =>
  api.get("/api/v1/branch-issues/corp-users");

export const getIssueUsers = getIssueCorpUsers;

/* Issues */
export const listBranchIssues = (params = {}) =>
  api.get("/api/v1/branch-issues", { params });

export const getBranchIssue = (id) =>
  api.get(`/api/v1/branch-issues/${id}`);

export const createBranchIssue = (data) =>
  api.post("/api/v1/branch-issues", data);

export const deleteBranchIssue = (id) =>
  api.delete(`/api/v1/branch-issues/${id}`);

/* Status */
export const changeBranchIssueStatus = (id, status, remarks = "") =>
  api.put(`/api/v1/branch-issues/${id}/status`, { status, remarks });

/* Chat messages */
export const addBranchIssueMessage = (id, message, is_internal = false) =>
  api.post(`/api/v1/branch-issues/${id}/messages`, { message, is_internal });

/* File attachments */
export const uploadBranchIssueAttachment = (id, file) => {
  const fd = new FormData();
  fd.append("file", file);

  return api.post(`/api/v1/branch-issues/${id}/attachments`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* Analysis Dashboard */
export const getBranchIssueAnalysisDashboard = (params = {}) =>
  api.get("/api/v1/branch-issues/analysis-dashboard", { params });
