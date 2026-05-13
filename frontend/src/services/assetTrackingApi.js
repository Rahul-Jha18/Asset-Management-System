import api from "./api";

export const getAssetTrackingSummary = () =>
  api.get("/api/asset-tracking/summary");

export const getAssetTrackingList = (params = {}) =>
  api.get("/api/asset-tracking", { params });

export const getAssetTrackingDetail = (asset_id) =>
  api.get(`/api/asset-tracking/${asset_id}`);

export const scanAssetTrackingNow = () =>
  api.get("/api/asset-tracking/scan-now");

export const syncAssetTrackingFromMaster = (candidates) =>
  api.post("/api/asset-tracking/sync-from-master", { candidates });