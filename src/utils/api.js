// src/utils/api.js
import axios from "axios";

// ✅ .env의 REACT_APP_API_BASE 사용
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// (선택) 공통 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

// =========================
// Billing Keys
// =========================
export const billingKeysApi = {
  list: () => api.get("/billing-keys/list"),

  // ✅ PortOne confirm 호출 (billingIssueToken 확정)
  confirm: (billingIssueToken) =>
    api.post("/billing-keys/confirm", { billingIssueToken }),

  register: (payload) => {
    if (!payload || !payload.billingKey || !payload.rawJson) {
      return Promise.reject(new Error("Invalid payload for register"));
    }
    return api.post("/billing-keys/register", payload);
  },

  remove: (id) => api.delete(`/billing-keys/${id}`),
};

// =========================
// Subscriptions & Payments
// =========================
export const subscriptionApi = {
  start: (payload) => api.post("/subscriptions/start", payload),
  my: () => api.get("/subscriptions/me"),
};

export const paymentsApi = {
  confirm: (payload) => api.post("/payments/confirm", payload),
  lookup: (paymentId) => api.get(`/payments/${paymentId}`),
};

export default api;
