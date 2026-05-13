// src/services/assetService.js
import api from "./api";

export const getAssets = async (filters = {}) => {
  const params = new URLSearchParams({
    page: 1,
    limit: 500,
    ...filters,
  }).toString();

  const res = await api.get(`/api/assets?${params}`);

  // unwrap sendPaginated response
  return res.data?.data || res.data?.rows || [];
};

export default { getAssets };
