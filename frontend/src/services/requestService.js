// src/services/requestService.js
import api from "./api";

// user -> own requests
export const getMyRequests = async () => {
  const res = await api.get("/api/requests");
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
};

// admin/subadmin -> all requests
export const getAllRequests = async () => {
  const res = await api.get("/api/requests/all");
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
};

// only user should create (backend should also enforce)
export const addRequest = async (data) => {
  const res = await api.post("/api/requests", data);
  return res.data;
};

// admin/subadmin: status only
export const updateRequestStatus = async (id, status) => {
  const res = await api.put(`/api/requests/${id}`, { status });
  return res.data;
};

// admin/subadmin: full edit
export const editRequest = async (id, data) => {
  const res = await api.put(`/api/requests/${id}/edit`, data);
  return res.data;
};

// admin only
export const deleteRequest = async (id) => {
  const res = await api.delete(`/api/requests/${id}`);
  return res.data;
};

export default {
  getMyRequests,
  getAllRequests,
  addRequest,
  updateRequestStatus,
  editRequest,
  deleteRequest,
};
