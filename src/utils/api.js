// src/utils/api.js
import axios from "axios";

// ✅ .env의 REACT_APP_API_BASE 사용
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 90000, // 여유롭게 90초
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

  // PortOne confirm 호출 (billingIssueToken 확정)
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
  chargeAndConfirm: (payload) => api.post("/subscriptions/charge-and-confirm", payload),
  paymentStatus: (paymentId) => api.get(`/subscriptions/payments/${paymentId}`),
  invoiceStatus: (invoiceId) => api.get(`/subscriptions/invoices/${invoiceId}/status`),
  my: () => api.get("/subscriptions/me"),
};

export const paymentsApi = {
  confirm: (payload) => api.post("/payments/confirm", payload),
  // ✅ 서버가 제공하는 두 엔드포인트 모두 호환 (/payments/{paymentId} or /payments/{paymentId}/status)
  lookup: (paymentId) => api.get(`/payments/${encodeURIComponent(paymentId)}`),
  status: (paymentId) => api.get(`/payments/${encodeURIComponent(paymentId)}/status`),
};

export default api;
