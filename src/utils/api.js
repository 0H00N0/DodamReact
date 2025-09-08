import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,                  // ✅ HttpSession 쿠키 포함
  headers: { "Content-Type": "application/json" },
});

// 401이면 로그인 페이지로 유도 (필요 시)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // window.location.href = "/loginForm";
    }
    return Promise.reject(err);
  }
);

// 백엔드 엔드포인트 래핑
export const billingKeysApi = {
  list: () => api.get("/billing-keys/list"),
  register: (payload) => api.post("/billing-keys", payload),
  remove: (id) => api.delete(`/billing-keys/${id}`),
};

export const subscriptionApi = {
  start: (payload) => api.post("/sub", payload),             // { planCode, months, payId, mode }
  me: () => api.get("/sub/me"),
  detail: (id) => api.get(`/sub/${id}`),
  patch: (id, body) => api.patch(`/sub/${id}`, body),
  cancel: (id) => api.delete(`/sub/${id}`),
  summary: (id) => api.get(`/sub/${id}/summary`),
};

export const paymentsApi = {
  confirm: (invoiceId) => api.post("/payments/confirm", { invoiceId }),
};
