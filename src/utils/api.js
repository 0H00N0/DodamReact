// src/utils/api.js
import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 공통 에러 인터셉터 (필요 시 세션 만료 처리)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // TODO: 세션 만료 처리 (예: 로그인 페이지로 이동)
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// --------------------------------------
// payments / pg
// --------------------------------------
export const paymentsApi = {
  // 결제 승인
  confirm: (payload) => api.post(`/payments/confirm`, payload).then(r => r.data),

  // PG 조회: 서버에 구현된 엔드포인트에 맞춰 사용
  // 현재 코드 기준: GET /pg/lookup?txId=...&paymentId=...
  lookup: (params) => api.get(`/pg/lookup`, { params }).then(r => r.data),

  // RAW 디버깅용 (선택)
  getPayment: (paymentId) => api.get(`/pg/payments/${paymentId}`).then(r => r.data),
  getTransaction: (txId) => api.get(`/pg/transactions/${txId}`).then(r => r.data),
};

// --------------------------------------
// billing-keys
// --------------------------------------
export const billingKeysApi = {
  // 결제수단 등록
  register: (body) => api.post(`/billing-keys`, body).then(r => r.data),

  // 내 카드 목록 (배열 그대로 반환되게 백엔드 맞췄다면, 여기서도 data만 반환)
  list: () => api.get(`/billing-keys/list`).then(r => r.data),

  // 카드 삭제
  remove: (id) => api.delete(`/billing-keys/${id}`).then(r => r.data),

  // customerId 조회 (세션 기반)
  customerId: () => api.get(`/billing-keys/customer-id`).then(r => r.data),
};

// --------------------------------------
// subscription
// --------------------------------------
export const subscriptionApi = {
  // 구독 시작 (POST /sub)
  start: (payload) => api.post(`/sub`, payload).then(r => r.data),

  // create를 사용하는 기존 코드 호환용 별칭
  create: (payload) => api.post(`/sub`, payload).then(r => r.data),

  // 내 구독 현황
  me: () => api.get(`/sub/me`).then(r => r.data),

  // 상세/변경/취소/요약
  detail: (id) => api.get(`/sub/${id}`).then(r => r.data),
  patch: (id, body) => api.patch(`/sub/${id}`, body).then(r => r.data),
  cancel: (id) => api.delete(`/sub/${id}`).then(r => r.data),
  summary: (id) => api.get(`/sub/${id}/summary`).then(r => r.data),
};
