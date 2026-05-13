// src/services/deviceService.js
import api from './api';

/**
 * Fetch all branches
 * @param {string} token - JWT token
 * @returns {Promise<Array>} - List of branches
 */
export const getBranches = async (token) => {
  const res = await api.get('/api/branches', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Fetch devices, optionally filtered by branch
 * @param {string} token - JWT token
 * @param {number|string} [branchId] - Optional branch ID
 * @returns {Promise<Array>} - List of devices
 */
export const getDevices = async (token, branchId = '') => {
  const res = await api.get('/api/devices', {
    headers: { Authorization: `Bearer ${token}` },
    params: branchId ? { branchId } : {},
  });
  return res.data;
};

/**
 * Add a new device
 * @param {string} token - JWT token
 * @param {Object} deviceData - Device info { name, ip, model, branchId, status }
 * @returns {Promise<Object>} - Created device
 */
export const addDevice = async (token, deviceData) => {
  const res = await api.post('/api/devices', deviceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Update an existing device
 * @param {string} token - JWT token
 * @param {number|string} id - Device ID
 * @param {Object} deviceData - Updated device info
 * @returns {Promise<Object>} - Updated device
 */
export const updateDevice = async (token, id, deviceData) => {
  const res = await api.put(`/api/devices/${id}`, deviceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Delete a device
 * @param {string} token - JWT token
 * @param {number|string} id - Device ID
 * @returns {Promise<Object>} - Server response
 */
export const deleteDevice = async (token, id) => {
  const res = await api.delete(`/api/devices/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
