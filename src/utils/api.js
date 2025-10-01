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
  /** 카드 목록: 항상 200 + [] */
  list() {
    return api.get(`/billing-keys/list?u=${Date.now()}`);
  },

  /** 등록 시작 전에 payId 하나 미리 발급 (세션스토리지 regPayId 에 보관해서 사용) */
  prepare() {
    return api.post("/billing-keys/prepare", {});
  },

  /** PortOne 리다이렉트 확정 (토큰 + payId) */
  confirm(billingIssueToken, payId) {
    const payload = { billingIssueToken };
    if (payId) payload.payId = payId;
    return api.post("/billing-keys/confirm", payload);
  },
  register({ billingKey, rawJson }) {
     return api.post("/billing-keys/register", { billingKey, rawJson });
  },
};

/* =========================
 * Subscription API
 * ======================= */
export const subscriptionApi = {
  /** 구독 시작(결제 실행) */
  start(payload) {
    return api.post("/subscriptions/start", payload);
  },

  /** 사용 금지 (백엔드 엔드포인트 없음) */
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

export default api;

// === 공용 호출 ===
export async function postWithSession(path, data, config) {
  const { data: json } = await api.post(path, data, config);
  return json;
}

export async function getWithSession(path, config) {
  // ✅ 비로그인 초기 화면에서 콘솔 401을 없애기 위해:
  //    /member/me 는 '로그인 힌트'가 없으면 요청 자체를 생략
  if (path === "/member/me") {
    const hint = sessionStorage.getItem("auth_hint");
    if (!hint) {
      return { login: false }; // 요청 생략 → 콘솔에 401이 안 찍힘
    }
  }

  try {
    const { data: json } = await api.get(path, config);
    return json;
  } catch (err) {
    // 안전망: 혹시 다른 경로로 호출돼도 401은 미로그인으로 취급
    if (path === "/member/me" && (err.status === 401 || String(err.message).includes("401"))) {
      return { login: false };
    }
    throw err;
  }
}

// === 편의 함수 ===
export async function loginWithOAuth(provider, payload) {
  // payload: { token? , code?, state? }
  const json = await postWithSession(`/oauth/${provider}/token`, payload);
  try {
    sessionStorage.setItem("auth_hint", "1");          // 다음 부팅에만 /member/me 조회
    window.dispatchEvent(new Event("auth:changed"));   // 전역 상태 갱신
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
