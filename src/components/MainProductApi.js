// dodam/src/components/MainProductApi.js
import { api } from "../utils/api";

// 신상품(이름 단위, 대표 1개씩)
export const fetchNewProducts = (limit = 12) =>
  api.get("/api/products/new", { params: { limit } });

// 인기상품(이름 단위 집계 DTO)
export const fetchPopularProducts = (limit = 12) =>
  api.get("/api/products/popular", { params: { limit } });

// ✅ 히어로 전용: 1개만 뽑기
export async function fetchNewestProduct() {
  const { data } = await api.get("/api/products/new", { params: { limit: 1 } });
  return Array.isArray(data) ? data[0] ?? null : null;
}

export async function fetchTopRentedProduct() {
  const { data } = await api.get("/api/products/popular", { params: { limit: 1 } });
  return Array.isArray(data) ? data[0] ?? null : null;
}

export async function fetchProductImages(proId, limit = 4) {
  if (!proId) return [];
  const { data } = await api.get(`/api/products/${proId}/images`, { params: { limit } });
  return Array.isArray(data) ? data.filter(Boolean) : [];
}
