// src/services/requestService.js
import api from "./api";

export const getRequests = async () => {
  const res = await api.get("/api/requests");
  return Array.isArray(res.data) ? res.data : [];
};

export const getAllRequests = async () => {
  const res = await api.get("/api/requests/all");
  return Array.isArray(res.data) ? res.data : [];
};

export const addRequest = async (data) => {
  const res = await api.post("/api/requests", data);
  return res.data;
};

export const updateRequestStatus = async (id, status) => {
  const res = await api.put(`/api/requests/${id}`, { status });
  return res.data;
};

export const deleteRequest = async (id) => {
  const res = await api.delete(`/api/requests/${id}`);
  return res.data;
};

export default {
  getRequests,
  getAllRequests,
  addRequest,
  updateRequestStatus,
  deleteRequest,
};
