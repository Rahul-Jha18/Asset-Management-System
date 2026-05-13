// src/services/branchService.js
import api from "./api";

export const getBranches = async () => {
  const res = await api.get("/api/branches?page=1&limit=500");
  return res.data?.data || res.data?.rows || [];
};

export default { getBranches };
