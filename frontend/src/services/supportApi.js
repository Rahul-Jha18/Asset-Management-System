import api from "./api";

export const submitSupportTicket = (data) =>
  api.post("/api/support", data);

export const getMySupportTickets = () =>
  api.get("/api/support/my");

export const getAllSupportTickets = () =>
  api.get("/api/support");

export const getSupportTicketById = (id) =>
  api.get(`/api/support/${id}`);

export const updateSupportTicketStatus = (id, status) =>
  api.put(`/api/support/${id}/status`, { status });

export const assignSupportTicket = (id, assigned_to_role) =>
  api.put(`/api/support/${id}/assign`, { assigned_to_role });

export const replySupportTicket = (id, message) =>
  api.post(`/api/support/${id}/reply`, { message });

export const forwardSupportTicket = (id, remark) =>
  api.post(`/api/support/${id}/forward`, { remark });

export const editSupportTicket = (id, data) =>
  api.patch(`/api/support/${id}/edit`, data);

export const deleteSupportTicket = (id) =>
  api.delete(`/api/support/${id}`);