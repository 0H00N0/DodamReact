// src/MainFeedApi.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "", // CRA proxy 쓰면 "" 유지
});

export async function fetchLatestReviews(limit = 3) {
  const { data } = await api.get("/api/main/reviews", { params: { limit } });
  return Array.isArray(data) ? data : [];
}

export async function fetchLatestNotices(limit = 3) {
  const { data } = await api.get("/api/main/notice/latest", { params: { limit } });
  return Array.isArray(data) ? data : [];
}

export async function fetchPopularCommunity(limit = 3) {
  const { data } = await api.get("/api/main/community/popular", { params: { limit } });
  return Array.isArray(data) ? data : [];
}
