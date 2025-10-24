// src/api/communityApi.js
import { api, ensureCsrfCookie } from "../utils/api";

// ✅ 안전한 문자열 변환 유틸
const toTrimmedString = (v) =>
  (typeof v === "string" ? v : String(v ?? "")).trim();

/** 게시글 */
export const boardsApi = {
  list: ({ page = 0, size = 15, bcanum, bsnum, q } = {}) =>
    api.get("/board/community", { params: { page, size, bcanum, bsnum, q } }).then(r => r.data),
  get: (bnum) => api.get(`/board/community/${bnum}`).then(r => r.data),
  create: async (payload) => {
    await ensureCsrfCookie();
    const body = {
      ...payload,
      bsub:
        payload?.bsub ?? payload?.btitle ?? payload?.title ?? payload?.subject ?? "(제목 없음)",
      bcontent: payload?.bcontent ?? payload?.content ?? payload?.body ?? payload?.btext ?? "",
    };
    const { data } = await api.post("/board/community", body);
    return data;
  },
  update: async (bnum, payload) => {
    await ensureCsrfCookie();
    const body = {
      ...payload,
      bsub: payload?.bsub ?? payload?.btitle ?? payload?.title ?? payload?.subject ?? "(제목 없음)",
      bcontent: payload?.bcontent ?? payload?.bcontent ?? payload?.content ?? "",
    };
    const { data } = await api.put(`/board/community/${bnum}`, body);
    return data;
  },
  remove: async (bnum) => {
    await ensureCsrfCookie();
    const { data } = await api.delete(`/board/community/${bnum}`);
    return data;
  },
};

/** 댓글 */
export const commentsApi = {
  // GET /board/community/{bnum}/comments
  list: (bnum) => api.get(`/board/community/${bnum}/comments`).then(r => r.data),

  // POST /board/community/{bnum}/comments
  create: async (bnum, payload) => {
    await ensureCsrfCookie();
    const ccontent = toTrimmedString(payload?.ccontent ?? payload?.content ?? "");
    const parentConum = payload?.parentConum ?? null;
    const { data } = await api.post(`/board/community/${bnum}/comments`, { ccontent, parentConum });
    return data;
  },

  // PUT /board/community/{bnum}/comments/{conum}
  update: async (bnum, conum, payload) => {
    await ensureCsrfCookie();
    const ccontent = toTrimmedString(payload?.ccontent ?? payload?.content ?? "");
    const { data } = await api.put(`/board/community/${bnum}/comments/${conum}`, { ccontent });
    return data;
  },

  // DELETE /board/community/{bnum}/comments/{conum}
  remove: async (bnum, conum) => {
    await ensureCsrfCookie();
    const { data } = await api.delete(`/board/community/${bnum}/comments/${conum}`);
    return data;
  },
};
