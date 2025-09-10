// src/utils/api.js
import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // window.location.href = "/loginForm";
    }
    return Promise.reject(err);
  }
);

// ✅ billingKeys API
export const billingKeysApi = {
  list: () => api.get("/billing-keys/list"),
  register: (payload) => api.post("/billing-keys", payload),
  remove: (id) => api.delete(`/billing-keys/${id}`),
};

// ✅ subscription API
export const subscriptionApi = {
  start: (payload) => api.post("/sub", payload),
  me: () => api.get("/sub/me"),
  detail: (id) => api.get(`/sub/${id}`),
  patch: (id, body) => api.patch(`/sub/${id}`, body),
  cancel: (id) => api.delete(`/sub/${id}`),
  summary: (id) => api.get(`/sub/${id}/summary`),
};

// ✅ payments API (혼합 confirm)
export const paymentsApi = {
  confirm: (payload) => api.post("/payments/confirm", payload),
  getPayment: (paymentId) => api.get(`/payments/${paymentId}`),
  getTransaction: (txId) => api.get(`/transactions/${txId}`),
};
