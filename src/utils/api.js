// src/utils/api.js
import axios from "axios";

/** API Base */
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://localhost:8080";

/** axios instance */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 90000,
});

/** 에러 인터셉터: 메시지 표준화(원본 보존) */
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

    err.message =
      serverMsg || (status ? `HTTP ${status}` : "") || err.message || "Request error";
    err.status = status;
    err.path = err?.config?.url;

    return Promise.reject(err);
  }
);

/* =========================
 * Billing Keys API
 * ======================= */
export const billingKeysApi = {
  /** ✅ 카드 목록: 표준 경로 사용 (cache bust) */
  list() {
    return api.get(`/billing-keys?u=${Date.now()}`);
  },

  /** 등록 시작 전에 payId 하나 미리 발급 (선택 사항 / 서버가 제공하는 경우만) */
  prepare() {
    return api.post("/billing-keys/prepare", {});
  },

  /** PortOne 리다이렉트 확정 (선택 사항 / 서버가 제공하는 경우만) */
  confirm(billingIssueToken, payId) {
    const payload = { billingIssueToken };
    if (payId) payload.payId = payId;
    return api.post("/billing-keys/confirm", payload);
  },

  /** 서버에 빌링키 저장 */
  register({ billingKey, rawJson }) {
    return api.post("/billing-keys/register", { billingKey, rawJson });
  },

  /** ✅ 카드 삭제(비활성화) — payId 기반 */
  deleteById(payId) {
    if (payId == null) {
      return Promise.reject(new Error("payId is required"));
    }
    return api.delete(`/billing-keys/by-id/${encodeURIComponent(payId)}`);
  },

  /** ✅ 카드 삭제(비활성화) — billingKey 기반 */
  deleteByKey(billingKey) {
    if (!billingKey) {
      return Promise.reject(new Error("billingKey is required"));
    }
    return api.delete(`/billing-keys/${encodeURIComponent(billingKey)}`);
  },

  /** ✅ 과거 호환용 (billingKey 기반) */
  delete(billingKey) {
    return this.deleteByKey(billingKey);
  },

  /** ✅ 편의 함수: payId 우선, 없으면 billingKey로 삭제 */
  remove({ payId, billingKey }) {
    if (payId != null) return this.deleteById(payId);
    if (billingKey) return this.deleteByKey(billingKey);
    return Promise.reject(new Error("Either payId or billingKey is required"));
  },
};

/* =========================
 * Subscription API
 * ======================= */
export const subscriptionApi = {
  start(payload) {
    return api.post("/subscriptions/start", payload);
  },
  chargeAndConfirm() {
    return Promise.reject(new Error("not supported"));
  },
};

export const paymentsApi = {
  confirm: (payload) => api.post("/payments/confirm", payload),

  // ✅ 서버가 제공하는 두 엔드포인트 모두 호환 (/payments/{paymentId} or /payments/{paymentId}/status)
  lookup: (paymentId) => {
    if (!paymentId) return Promise.reject(new Error("paymentId is required"));
    return api.get(`/payments/${encodeURIComponent(paymentId)}`);
  },
  status: (paymentId) => {
    if (!paymentId) return Promise.reject(new Error("paymentId is required"));
    return api.get(`/payments/${encodeURIComponent(paymentId)}/status`);
  },
};

/** ✅ 결제 취소(부분/전액 가능) */
export const cancelPayment = (paymentId, reason = "사용자 요청") =>
  api.post(`/payments/${encodeURIComponent(paymentId)}/cancel`, { reason });

/** ✅ 다음 결제 예약 해지(구독 해지) */
export const cancelNextRenewal = (reason = "사용자 해지 요청") =>
  api.post("/subscriptions/cancel-renewal", { reason });

export default api;

/* =========================
 * 공용 호출
 * ======================= */
export async function postWithSession(path, data, config) {
  const { data: json } = await api.post(path, data, config);
  return json;
}

export async function getWithSession(path, config) {
  // 비로그인 초기 화면에서 /member/me 401 콘솔 노이즈 방지
  if (path === "/member/me") {
    const hint = sessionStorage.getItem("auth_hint");
    if (!hint) {
      return { login: false };
    }
  }

  try {
    const { data: json } = await api.get(path, config);
    return json;
  } catch (err) {
    if (path === "/member/me" && (err.status === 401 || String(err.message).includes("401"))) {
      return { login: false };
    }
    throw err;
  }
}

/* =========================
 * 편의 함수
 * ======================= */
export async function loginWithOAuth(provider, payload) {
  const json = await postWithSession(`/oauth/${provider}/token`, payload);
  try {
    sessionStorage.setItem("auth_hint", "1");
    window.dispatchEvent(new Event("auth:changed"));
  } catch {}
  return json;
}

export async function logout() {
  const json = await postWithSession("/member/logout", {});
  try {
    sessionStorage.removeItem("auth_hint");
    window.dispatchEvent(new Event("auth:changed"));
  } catch {}
  return json;
}
