// src/utils/api.js
import axios from "axios";

/** API Base */
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://3.38.29.41:8080";

/** axios instance */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 90000,
  // 아래 두 값은 기본값과 동일하지만, 명시 유지해도 무방
  xsrfCookieName: "XSRF-TOKEN",   // Spring Security 기본 쿠키명
  xsrfHeaderName: "X-XSRF-TOKEN", // 이 헤더로 전송
});

// ✅ JSON 기본 헤더 고정
api.defaults.headers.post["Content-Type"]  = "application/json;charset=UTF-8";
api.defaults.headers.put["Content-Type"]   = "application/json;charset=UTF-8";
api.defaults.headers.patch["Content-Type"] = "application/json;charset=UTF-8";

/* -------------------------------------------------
 * CSRF: 서버가 CSRF를 비활성화했어도 안전하게 동작하도록 no-op 처리
 * ------------------------------------------------*/

/** ✅ (패치) 더 이상 /csrf 엔드포인트를 호출하지 않음 */
export async function ensureCsrfCookie() {
  // CSRF 비활성화 환경에서 500을 방지하기 위해 아무 것도 하지 않음
  console.log("123456123465[api] ensureCsrfCookie CALLED — should be no-op");
  return;
}

/** 쿠키에서 XSRF-TOKEN 추출 (있으면 헤더로 실어 보냄) */
function readCsrfFromCookie() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/* ---------- 요청 인터셉터 ----------
 * - 상태변경(POST/PUT/PATCH/DELETE)일 때, 쿠키에 토큰이 있으면 헤더 주입
 * - /csrf 호출은 절대 하지 않음
 */
api.interceptors.request.use(async (cfg) => {
  cfg.withCredentials = true;

  const method = (cfg.method || "get").toUpperCase();
  const isStateChanging = !["GET", "HEAD", "OPTIONS"].includes(method);
  const token = readCsrfFromCookie();

  if (token) {
    cfg.headers = cfg.headers || {};
    // 상태변경/조회 상관없이 있으면 실어 보냄(무해)
    if (!cfg.headers["X-XSRF-TOKEN"]) {
      cfg.headers["X-XSRF-TOKEN"] = token;
    }
  }

  // ❌ 여기서 /csrf를 호출하거나 재시도하지 않음
  return cfg;
});

/** 에러 인터셉터: 메시지 표준화
 *  - (패치) 403을 이유로 /csrf 재시도 로직을 완전히 제거
 */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const cfg = err?.config || {};

    // 표준 메시지 정리
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
    err.path = cfg?.url;

    return Promise.reject(err);
  }
);

export default api;

/* =========================
 * 공용 호출
 * ======================= */
export async function postWithSession(path, data, config) {
  const { data: json } = await api.post(path, data, config);
  return json;
}

export async function getWithSession(path, config) {
  if (path === "/member/me") {
    const hint =
      typeof sessionStorage !== "undefined" && sessionStorage.getItem("auth_hint");
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
 * Billing Keys API
 * ======================= */
export const billingKeysApi = {
  list() {
    return api.get(`/billing-keys?u=${Date.now()}`);
  },
  prepare() {
    return api.post("/billing-keys/prepare", {});
  },
  confirm(billingIssueToken, payId) {
    const payload = { billingIssueToken };
    if (payId) payload.payId = payId;
    return api.post("/billing-keys/confirm", payload);
  },
  register({ billingKey, rawJson }) {
    return api.post("/billing-keys/register", { billingKey, rawJson });
  },
  deleteById(payId) {
    if (payId == null) return Promise.reject(new Error("payId is required"));
    return api.delete(`/billing-keys/by-id/${encodeURIComponent(payId)}`);
  },
  deleteByKey(billingKey) {
    if (!billingKey) return Promise.reject(new Error("billingKey is required"));
    return api.delete(`/billing-keys/${encodeURIComponent(billingKey)}`);
  },
  delete(billingKey) {
    return this.deleteByKey(billingKey);
  },
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
  lookup: (paymentId) => {
    if (!paymentId) return Promise.reject(new Error("paymentId is required"));
    return api.get(`/payments/${encodeURIComponent(paymentId)}`);
  },
  status: (paymentId) => {
    if (!paymentId) return Promise.reject(new Error("paymentId is required"));
    return api.get(`/payments/${encodeURIComponent(paymentId)}/status`);
  },
};

export const cancelPayment = (paymentId, reason = "사용자 요청") =>
  api.post(`/payments/${encodeURIComponent(paymentId)}/cancel`, { reason });

export const cancelNextRenewal = (reason = "사용자 해지 요청") =>
  api.post("/subscriptions/cancel-renewal", { reason });

/* =========================
 * 편의 함수
 * ======================= */
export async function loginWithOAuth(provider, payload) {
  const json = await postWithSession(`/oauth/${provider}/token`, payload);
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("auth_hint", "1");
      window.dispatchEvent(new Event("auth:changed"));
    }
  } catch {}
  return json;
}

export async function logout() {
  const json = await postWithSession("/member/logout", {});
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("auth_hint");
      window.dispatchEvent(new Event("auth:changed"));
    }
  } catch {}
  return json;
}
