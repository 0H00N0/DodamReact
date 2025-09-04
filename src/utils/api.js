import axios from "axios";

export const API_BASE_URL = "http://localhost:8080"; // 필요시 api-config.js를 참조하도록 바꿔도 됩니다.

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,        // ★ 세션 쿠키 왕복 필수
});
