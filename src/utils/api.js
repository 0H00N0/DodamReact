// src/utils/api.js
import axios from "axios";

/** API Base */
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://192.168.219.176:8080";

/** axios instance */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 90000,
  xsrfCookieName: "XSRF-TOKEN",   // Spring Security 기본 쿠키명
  xsrfHeaderName: "X-XSRF-TOKEN", // 이 헤더로 전송
});

// ✅ JSON 기본 헤더 고정
api.defaults.headers.post["Content-Type"]  = "application/json;charset=UTF-8";
api.defaults.headers.put["Content-Type"]   = "application/json;charset=UTF-8";
api.defaults.headers.patch["Content-Type"] = "application/json;charset=UTF-8";

/* -------------------------------------------------
 * CSRF: 상태 변경 전 쿠키 보장 & 403 시 자동 재시도
 * ------------------------------------------------*/
let _csrfPromise = null;
let _csrfStamp = 0;

/** ✅ CSRF 토큰 쿠키(XSRF-TOKEN) 보장 */
export async function ensureCsrfCookie(force = false) {
  const hasCookie =
    typeof document !== "undefined" && document.cookie.includes("XSRF-TOKEN=");
  const now = Date.now();

  if (!force && hasCookie) return;

  if (_csrfPromise && now - _csrfStamp < 1000) {
    return _csrfPromise;
  }

  _csrfStamp = now;
  _csrfPromise = (async () => {
    try {
      // ✔️ 토큰 강제 생성/쿠키 발급 전용 엔드포인트
      await api.get("/csrf", { params: { u: Date.now() } });
    } catch {
      // 무시(목적: 쿠키 발급 유도)
    }
  })();

  return _csrfPromise.finally(() => {
    _csrfPromise = null;
  });
}

/** 쿠키에서 XSRF-TOKEN 추출 */
function readCsrfFromCookie() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/* ---------- 요청 인터셉터 ----------
 * - 상태변경(POST/PUT/PATCH/DELETE)인데 헤더가 없으면 토큰 확보 → 헤더 주입
 */
api.interceptors.request.use(async (cfg) => {
  cfg.withCredentials = true;

  const method = (cfg.method || "get").toUpperCase();
  const isStateChanging = !["GET", "HEAD", "OPTIONS"].includes(method);

  // 헤더가 없으면 토큰 확보 시도
  if (isStateChanging && !cfg.headers?.["X-XSRF-TOKEN"]) {
    await ensureCsrfCookie(); // 필요하면 발급
    const token = readCsrfFromCookie();
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers["X-XSRF-TOKEN"] = token;
    }
  } else {
    // 토큰이 이미 있다면 유지, 없으면(읽기요청 등) 그냥 진행
    const token = readCsrfFromCookie();
    if (token && !cfg.headers?.["X-XSRF-TOKEN"]) {
      cfg.headers = cfg.headers || {};
      cfg.headers["X-XSRF-TOKEN"] = token;
    }
  }

  return cfg;
});

/** 에러 인터셉터: 메시지 표준화 + CSRF 403 자동 재시도(1회) */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const cfg = err?.config || {};

    const maybeInvalidCsrf =
      status === 403 &&
      !cfg.__retriedForCsrf &&
      (String(data?.message || data?.error || "").toLowerCase().includes("csrf") ||
        String(data).toLowerCase().includes("csrf"));

    if (maybeInvalidCsrf) {
      try {
        await ensureCsrfCookie(true);
        cfg.__retriedForCsrf = true;
        const token = readCsrfFromCookie();
        if (token) {
          cfg.headers = cfg.headers || {};
          cfg.headers["X-XSRF-TOKEN"] = token;
        }
        return api.request(cfg);
      } catch {
        // 재시도 실패 → 그대로 떨어뜨림
      }
    }

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
