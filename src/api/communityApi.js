// src/api/communityApi.js
import { api, ensureCsrfCookie } from "../utils/api";

// 안전한 문자열 변환
const toTrim = (v) => (typeof v === "string" ? v : String(v ?? "")).trim();

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
  create: async (payload = {}) => {
    await ensureCsrfCookie();
    const body = {
      // ▶ 서버가 받는 키만 명시 (화이트리스트)
      bsub: toTrim(
        payload.bsub ??
          payload.btitle ??
          payload.title ??
          payload.subject ??
          ""
      ),
      bcontent: toTrim(
        payload.bcontent ?? payload.content ?? payload.body ?? payload.btext ?? ""
      ),
      bcanum: Number(payload.bcanum ?? 3),
      // 필요 시 사용: bsnum: Number(payload.bsnum ?? 1),
    };
    if (!body.bsub) throw new Error("제목을 입력하세요.");
    if (!body.bcontent) throw new Error("내용을 입력하세요.");

    const { data } = await api.post("/board/community", body);
    return data;
  },

  // PUT /board/community/{bnum}
  update: async (bnum, payload = {}) => {
    await ensureCsrfCookie();
    const body = {
      bsub: toTrim(
        payload.bsub ??
          payload.btitle ??
          payload.title ??
          payload.subject ??
          ""
      ),
      bcontent: toTrim(
        payload.bcontent ?? payload.content ?? payload.body ?? payload.btext ?? ""
      ),
      bcanum: Number(payload.bcanum ?? 3),
      // bsnum: Number(payload.bsnum ?? 1),
    };
    if (!body.bsub) throw new Error("제목을 입력하세요.");
    if (!body.bcontent) throw new Error("내용을 입력하세요.");

    const { data } = await api.put(`/board/community/${bnum}`, body);
    return data;
  },

  // DELETE /board/community/{bnum}
  remove: async (bnum) => {
    await ensureCsrfCookie();
    const { data } = await api.delete(`/board/community/${bnum}`);
    return data;
  },
};

/** 댓글 */
export const commentsApi = {
  // GET /board/community/{bnum}/comments
  list: (bnum) => api.get(`/board/community/${bnum}/comments`).then((r) => r.data),

  // POST /board/community/{bnum}/comments
  create: async (bnum, payload = {}) => {
    await ensureCsrfCookie();
    const ccontent = toTrim(payload.ccontent ?? payload.content ?? "");
    const parentConum = payload.parentConum ?? null;
    const { data } = await api.post(`/board/community/${bnum}/comments`, {
      ccontent,
      parentConum,
    });
    return data;
  },

  // PUT /board/community/{bnum}/comments/{conum}
  update: async (bnum, conum, payload = {}) => {
    await ensureCsrfCookie();
    const ccontent = toTrim(payload.ccontent ?? payload.content ?? "");
    const { data } = await api.put(`/board/community/${bnum}/comments/${conum}`, {
      ccontent,
    });
    return data;
  },

  // DELETE /board/community/{bnum}/comments/{conum}
  remove: async (bnum, conum) => {
    await ensureCsrfCookie();
    const { data } = await api.delete(`/board/community/${bnum}/comments/${conum}`);
    return data;
  },
};
