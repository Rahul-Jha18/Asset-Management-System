// src/services/api.js
import axios from "axios";
import { HTTP_STATUS, API_TIMEOUT, STORAGE_KEYS } from "../utils/constants";

const API_PORT = 5000;

const baseURL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;

const api = axios.create({
  baseURL,
  timeout: API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const safeParse = (v) => {
      try {
        return JSON.parse(v || "null");
      } catch {
        return null;
      }
    };

    const stored =
      safeParse(localStorage.getItem(STORAGE_KEYS.USER)) ||
      safeParse(sessionStorage.getItem(STORAGE_KEYS.USER)) ||
      safeParse(localStorage.getItem("ims_user")) ||
      safeParse(sessionStorage.getItem("ims_user"));

    const token = stored?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, request, message } = error;

    if (response) {
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem("ims_user");
        sessionStorage.removeItem("ims_user");
        window.location.href = "/login";
      }

      if (response.status === HTTP_STATUS.FORBIDDEN) {
        window.location.href = "/unauthorized";
      }

      try {
        if (response.data instanceof Blob) {
          const text = await response.data.text();
          try {
            const parsed = JSON.parse(text);
            console.error("API error:", response.status, parsed);
          } catch {
            console.error("API error:", response.status, text);
          }
        } else {
          console.error("API error:", response.status, response.data);
        }
      } catch {
        console.error("API error:", response.status, response.data);
      }
    } else if (request) {
      console.error("No response received. API baseURL:", baseURL);
      console.error("Request:", request);
    } else {
      console.error("Request setup error:", message);
    }

    return Promise.reject(error);
  }
);

export default api;