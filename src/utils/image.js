// src/utils/image.js
import logo from "../images/logo.png";

// 절대/프로토콜상대/데이터/블랍 URL 판별
const ABSOLUTE_URL_RE = /^(https?:)?\/\//i;   // https://..., http://..., //cdn...
const DATA_URL_RE = /^data:image\//i;         // data:image/png;base64,...
const BLOB_URL_RE = /^blob:/i;                // blob:...

export const PLACEHOLDER_IMG = logo;

/**
 * 이미지 경로 정규화
 * - 절대/프로토콜상대/데이터/블랍 URL → 그대로 사용
 * - 상대 경로/파일명 → REACT_APP_API_BASE + 경로
 * - null/빈 값 → PLACEHOLDER_IMG
 */
export function normalizeImage(url) {
  const u = String(url || "").trim();
  if (!u) return PLACEHOLDER_IMG;

  if (ABSOLUTE_URL_RE.test(u) || DATA_URL_RE.test(u) || BLOB_URL_RE.test(u)) {
    return u;
  }

  const base = (process.env.REACT_APP_API_BASE || "http://localhost:8080").replace(/\/$/, "");
  const path = u.startsWith("/") ? u : `/${u}`;
  return base + path;
}

/** <img> onError 핸들러: 실패 시 로고로 대체 */
export function onImgError(e) {
  if (!e?.currentTarget) return;
  e.currentTarget.src = PLACEHOLDER_IMG;
}
