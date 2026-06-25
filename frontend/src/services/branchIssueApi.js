import api from "./api";

/* ─────────────────────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────────────────────── */
export const getIssueCategories = () => {
  return api.get("/api/v1/branch-issues/categories");
};

/* ─────────────────────────────────────────────────────────────
   ISSUES
───────────────────────────────────────────────────────────── */
export const listBranchIssues = (params = {}) => {
  return api.get("/api/v1/branch-issues", { params });
};

export const getBranchIssue = (id) => {
  return api.get(`/api/v1/branch-issues/${id}`);
};

export const createBranchIssue = (data) => {
  return api.post("/api/v1/branch-issues", data);
};

export const deleteBranchIssue = (id) => {
  return api.delete(`/api/v1/branch-issues/${id}`);
};

/* ─────────────────────────────────────────────────────────────
   STATUS
───────────────────────────────────────────────────────────── */
export const changeBranchIssueStatus = (id, status, remarks = "") => {
  return api.put(`/api/v1/branch-issues/${id}/status`, {
    status,
    remarks,
  });
};

/* ─────────────────────────────────────────────────────────────
   MESSAGES
───────────────────────────────────────────────────────────── */
export const addBranchIssueMessage = (id, message, is_internal = false) => {
  return api.post(`/api/v1/branch-issues/${id}/messages`, {
    message,
    is_internal,
  });
};

/* ─────────────────────────────────────────────────────────────
   ATTACHMENTS
───────────────────────────────────────────────────────────── */
export const uploadBranchIssueAttachment = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(`/api/v1/branch-issues/${id}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};