// src/api/communityApi.js
import { api, ensureCsrfCookie } from "../utils/api";

/** 게시글 */
export const boardsApi = {
  // GET /board/community?page=&size=&bcanum=&bsnum=&q=
  list: ({ page = 0, size = 15, bcanum, bsnum, q } = {}) =>
    api
      .get("/board/community", { params: { page, size, bcanum, bsnum, q } })
      .then((r) => r.data),

  // GET /board/community/{bnum}
  get: (bnum) => api.get(`/board/community/${bnum}`).then((r) => r.data),

  // POST /board/community
  // 프런트에서 title/content로 들어와도 bsub/bcontent로 매핑해 전송
  create: async (payload) => {
    await ensureCsrfCookie(); // 🔐 CSRF 쿠키 확보
    const body = {
      ...payload,
      bsub:
        payload?.bsub ??
        payload?.title ??
        payload?.subject ??
        payload?.btitle ??
        "(제목 없음)",
      bcontent:
        payload?.bcontent ?? payload?.content ?? payload?.body ?? payload?.btext,
    };
    const { data } = await api.post("/board/community", body);
    return data;
  },

  // PUT /board/community/{bnum}
  update: async (bnum, payload) => {
    await ensureCsrfCookie(); // 🔐
    const body = {
      ...payload,
      bsub:
        payload?.bsub ??
        payload?.title ??
        payload?.subject ??
        payload?.btitle,
      bcontent:
        payload?.bcontent ?? payload?.content ?? payload?.body ?? payload?.btext,
    };
    const { data } = await api.put(`/board/community/${bnum}`, body);
    return data;
  },

  // DELETE /board/community/{bnum}
  remove: async (bnum) => {
    await ensureCsrfCookie(); // 🔐
    const { data } = await api.delete(`/board/community/${bnum}`);
    return data;
  },
};

/** 댓글 */
export const commentsApi = {
  // GET /board/community/{bnum}/comments
  list: (bnum) =>
    api.get(`/board/community/${bnum}/comments`).then((r) => r.data),

  // POST /board/community/{bnum}/comments
  create: async (bnum, payload) => {
    await ensureCsrfCookie(); // 🔐
    const { data } = await api.post(`/board/community/${bnum}/comments`, payload);
    return data;
  },

  // PUT /board/community/{bnum}/comments/{conum}
  update: async (bnum, conum, payload) => {
    await ensureCsrfCookie(); // 🔐
    const { data } = await api.put(
      `/board/community/${bnum}/comments/${conum}`,
      payload
    );
    return data;
  },

  // DELETE /board/community/{bnum}/comments/{conum}
  remove: async (bnum, conum) => {
    await ensureCsrfCookie(); // 🔐
    const { data } = await api.delete(
      `/board/community/${bnum}/comments/${conum}`
    );
    return data;
  },
};
