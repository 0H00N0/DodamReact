// src/components/Home/MainProductApi.js
import { api } from "../utils/api";

/** 공통: 응답이 JSON인지 확인. JSON이 아니면 빈 구조 리턴하여 렌더가 안 깨지도록. */
function isJson(res) {
  const ct = res?.headers?.["content-type"] || res?.headers?.["Content-Type"];
  return typeof ct === "string" && ct.includes("application/json");
}
function safeList(res) {
  if (!res) return [];
  // 서버가 배열 또는 {content:[...]} 둘 다 지원한다고 가정
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.content)) return res.data.content;
  return [];
}

/** 쿼리스트링 생성 유틸: null/undefined/"" 값은 제외 */
function buildParams(obj = {}) {
  const params = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (typeof v === "string" && v.trim() === "") return;
    params[k] = v;
  });
  return params;
}

/** 신상품 */
export async function fetchNewProducts(limit = 12) {
  try {
    const res = await api.get("/api/products/new", { params: { limit } });
    if (!isJson(res) || res.status !== 200) {
      console.error("[fetchNewProducts] Non-JSON/BadStatus", res?.status, res?.data);
      return { data: [] };
    }
    return { data: safeList(res) };
  } catch (e) {
    console.error("[fetchNewProducts] error:", e);
    return { data: [] };
  }
}

/** 인기상품 */
export async function fetchPopularProducts(limit = 12) {
  try {
    const res = await api.get("/api/products/popular", { params: { limit } });
    if (!isJson(res) || res.status !== 200) {
      console.error("[fetchPopularProducts] Non-JSON/BadStatus", res?.status, res?.data);
      return { data: [] };
    }
    return { data: safeList(res) };
  } catch (e) {
    console.error("[fetchPopularProducts] error:", e);
    return { data: [] };
  }
}

/** 리뷰 카운트 (pronum 기준) */
export async function fetchReviewCountsByProductIds(ids = []) {
  if (!ids?.length) return {};
  try {
    const res = await api.get("/api/reviews/count", {
      params: { ids: ids.join(",") },
    });
    if (!isJson(res) || res.status !== 200) {
      console.error("[fetchReviewCounts] Non-JSON/BadStatus", res?.status, res?.data);
      return {};
    }
    return res.data?.counts || {};
  } catch (e) {
    console.error("[fetchReviewCounts] error:", e);
    return {};
  }
}

/**
 * 상품 이미지 조회 (여러 백엔드 변종을 자동 시도)
 * - 성공: 배열 반환
 * - 실패/비JSON/400~404: []
 */
export async function fetchProductImages(productId, limit = 4) {
  const n = typeof productId === "string" ? parseInt(productId, 10) : productId;
  if (!Number.isFinite(n) || n <= 0) return []; // 유효하지 않으면 요청 skip

  try {
    const res = await api.get(`/api/products/${n}/images`, { params: { limit } });
    const ct = res?.headers?.["content-type"] || res?.headers?.["Content-Type"] || "";
    if (!ct.includes("application/json") || res.status < 200 || res.status >= 300) return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.images)) return data.images;
    return [];
  } catch {
    return [];
  }
}

/**
 * 상품 검색 (이름 + 가격/연령 필터 + 정렬/페이징)
 * - 서버: GET /api/products/search
 * - params:
 *   q?: string
 *   ageMin?: number
 *   ageMax?: number
 *   priceMin?: number | string (BigDecimal 호환)
 *   priceMax?: number | string
 *   sort?: "RECENT" | "PRICE_ASC" | "PRICE_DESC" (default: RECENT)
 *   page?: number (default: 0)
 *   size?: number (default: 24)
 *
 * 반환: Spring Page<MainProductSearchDTO>
 */
export async function searchProductsByName({
  q = "",
  ageMin = null,
  ageMax = null,
  priceMin = null,
  priceMax = null,
  sort = "RECENT",
  page = 0,
  size = 24,
} = {}) {
  const params = buildParams({ q, ageMin, ageMax, priceMin, priceMax, sort, page, size });
  const res = await api.get("/api/products/search", { params });

  // 방어적 처리(에러나 HTML 반환 시 깨짐 방지)
  if (!isJson(res) || res.status < 200 || res.status >= 300) {
    console.error("[searchProductsByName] Non-JSON/BadStatus", res?.status);
    return { content: [], totalElements: 0, totalPages: 0, number: page, size };
  }
  return res.data;
}
