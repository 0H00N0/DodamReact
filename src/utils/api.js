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

// 🔧 에러 메시지 정규화(원본 err.response/status 보존)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;

    const serverMsg =
      (typeof data === "string" && data) ||
      data?.error ||
      data?.message ||
      data?.detail ||
      data?.msg ||
      data?.reason;

    // ✅ 새 Error를 만들지 않고, 메시지만 바꾸고 원본을 그대로 던진다
    err.message =
      serverMsg || (status ? `HTTP ${status}` : "") || err.message || "Request error";
    err.status = status;                 // 편의상 별도 필드도 유지
    err.path = err?.config?.url;

    return Promise.reject(err);
  }
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

// === 공용 호출 ===
export async function postWithSession(path, data, config) {
  const { data: json } = await api.post(path, data, config);
  return json;
}
export async function getWithSession(path, config) {
  const { data: json } = await api.get(path, config);
  return json;
}

// === 편의 함수 ===
export async function fetchMe() {
  // 세션 확인은 가벼운 /oauth/me로 통일
  return getWithSession("/oauth/me");
}

export async function loginWithOAuth(provider, payload) {
  // payload: { token? , code?, state? }
  const json = await postWithSession(`/oauth/${provider}/token`, payload);
  try { window.dispatchEvent(new Event("auth:changed")); } catch {}
  return json;
}

export async function logout() {
  // 백엔드와 일치하도록 /member/logout 사용
  const json = await postWithSession("/member/logout", {});
  try { window.dispatchEvent(new Event("auth:changed")); } catch {}
  return json;
}
