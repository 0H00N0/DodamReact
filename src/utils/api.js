// utils/api.js
import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ 세션 쿠키 왕복
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
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
