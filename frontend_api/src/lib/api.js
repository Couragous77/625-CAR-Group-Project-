// src/lib/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: false,
  timeout: 15000,
});

// Attach token if you store it (optional)
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Normalize errors to { message, code, fields }
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data || {};
    const normalized = {
      message:
        data.message ||
        (status === 422
          ? "Please correct the highlighted fields."
          : "Something went wrong. Please try again."),
      code: data.code || `HTTP_${status || "ERROR"}`,
      fields: data.fields || null,
    };
    return Promise.reject(normalized);
  }
);

// Example auth service
export const auth = {
  async register(payload) {
    const { data } = await api.post("/api/register", payload);
    return data;
  },
  async login(payload) {
    const { data } = await api.post("/api/login", payload);
    return data;
  },
};
