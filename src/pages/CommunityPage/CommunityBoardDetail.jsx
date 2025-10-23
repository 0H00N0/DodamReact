// src/pages/community/CommunityBoardDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { boardsApi, commentsApi } from "../../api/communityApi";
import { useAuth } from "../../contexts/AuthContext";
import { ensureCsrfCookie } from "../../utils/api"; // ✅ 유지

// 날짜 파싱/포맷 유틸
const parseDate = (v) => {
  if (!v) return null;
  if (Array.isArray(v)) {
    const [y, m, d, hh = 0, mi = 0, ss = 0] = v;
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh, mi, ss);
    return isNaN(dt) ? null : dt;
  }
  if (typeof v === "string") {
    const s = v.includes("T") ? v : v.replace(" ", "T");
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }
  const d = new Date(v);
  return isNaN(d) ? null : d;
};
const fmt = (value) => {
  const d = parseDate(value);
  if (!d) return "-";
  const yy = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${yy}-${m}-${dd} ${hh}:${mm}`;
};
const buildDateLabel = (created, edited) => {
  const c = parseDate(created);
  const e = parseDate(edited);
  const isEdited = !!e && (!c || e.getTime() !== c.getTime());
  return isEdited ? `${fmt(e)} (수정됨)` : fmt(c);
};

export default function CommunityBoardDetail() {
  const { bnum } = useParams();
  const id = Number(bnum);
  const nav = useNavigate();
  const { user: currentUser } = useAuth() || {};
  const actorMid = currentUser?.mid;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cval, setCval] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const load = async () => {
    try {
      if (!Number.isFinite(id)) throw new Error("INVALID_ARGUMENT");
      setLoading(true);
      const p = await boardsApi.get(id);
      setPost(p);
      setComments(await commentsApi.list(id));
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (e) {
      const code = e?.status;
      if (code === 404 || /not\s*found/i.test(e.message)) {
        nav(`/error?code=404&reason=${encodeURIComponent("게시글을 찾을 수 없습니다.")}`, { replace: true });
      } else {
        nav(`/error?code=${code || 400}&reason=${encodeURIComponent(e.message || "요청 오류")}`, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const addC = async () => {
    if (!actorMid) return alert("로그인 후 댓글 작성 가능합니다.");
    const text = cval.trim(); if (!text) return;

    // ✅ 상태 변경 전 쿠키/헤더 보장
    await ensureCsrfCookie();

    await commentsApi.create(id, {
      ccontent: text,
      parentConum: replyTo?.conum || null,
    });
    setCval("");
    setReplyTo(null);
    setComments(await commentsApi.list(id));
  };

  const editC = async (conum) => {
    const find = (list) => {
      for (const c of list) {
        if (c.conum === conum) return c;
        if (c.children) {
          const f = find(c.children);
          if (f) return f;
        }
      }
      return null;
    };
    const curr = find(comments)?.ccontent || "";
    const next = prompt("댓글 수정", curr); if (next == null) return;

    await ensureCsrfCookie();

    await commentsApi.update(id, conum, { ccontent: next });
    setComments(await commentsApi.list(id));
  };

  const delC = async (conum) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;

    await ensureCsrfCookie();

    await commentsApi.remove(id, conum);
    setComments(await commentsApi.list(id));
  };

  if (loading) return <div className="max-w-3xl mx-auto p-4">로딩중…</div>;
  if (!post) return <div className="max-w-3xl mx-auto p-4">게시글을 찾을 수 없습니다.</div>;

  const author = post.mnic ?? post.nickname ?? post.mid ?? "익명";
  const dateLabel = buildDateLabel(post.bdate, post.bedate);

  const CommentItem = ({ c, depth = 0 }) => (
    <li className={`border rounded p-3 ${depth > 0 ? "ml-6" : ""}`}>
      <div className="text-xs text-gray-500 mb-2">
        {(c.mnic ?? c.mid) || "익명"} · {buildDateLabel(c.cdate, c.cedate)}
      </div>
      <div className="whitespace-pre-wrap">{c.ccontent}</div>
      <div className="flex gap-2 mt-2">
        <button
          className="px-2 py-1 border rounded text-sm"
          onClick={() => setReplyTo({ conum: c.conum, mnic: c.mnic ?? c.mid })}
        >
          답글
        </button>

        {(c?.mine || actorMid === c?.mid) && (
          <>
            <button onClick={() => editC(c.conum)} className="px-2 py-1 border rounded text-sm">수정</button>
            <button onClick={() => delC(c.conum)} className="px-2 py-1 border rounded text-sm">삭제</button>
          </>
        )}
      </div>

      {Array.isArray(c.children) && c.children.length > 0 && (
        <ul className="space-y-3 mt-3">
          {c.children.map((ch) => <CommentItem key={ch.conum} c={ch} depth={depth + 1} />)}
        </ul>
      )}
    </li>
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-2 text-sm text-gray-500">
        <Link to="/board/community" className="underline">목록</Link> / 상세
      </div>

      <h2 className="text-xl font-bold">{post.bsub ?? "(제목 없음)"}</h2>
      <div className="text-xs text-gray-500 mt-1">{author} · {dateLabel}</div>

      <article className="mt-4 whitespace-pre-wrap border rounded p-4 bg-white">
        {post.bcontent}
      </article>

      <div className="flex gap-2 justify-end mt-4">
        {(post?.mine || actorMid === post?.mid) && (
          <>
            <Link to={`/board/community/${id}/edit`} className="px-3 py-1 border rounded">수정</Link>
            <button
              className="px-3 py-1 border rounded"
              onClick={async () => {
                if (window.confirm("삭제할까요?")) {
                  await ensureCsrfCookie();
                  await boardsApi.remove(id);
                  nav("/board/community");
                }
              }}
            >
              삭제
            </button>
          </>
        )}
      </div>

      <hr className="my-6" />

      <h3 className="font-semibold mb-2">댓글 {comments.length}</h3>
      <ul className="space-y-3">
        {comments.map((c) => <CommentItem key={c.conum} c={c} />)}
        {comments.length === 0 && <li className="text-gray-500">첫 댓글을 남겨보세요.</li>}
      </ul>

      {actorMid ? (
        <div className="mt-3">
          {replyTo && (
            <div className="mb-2 text-xs text-gray-600">
              @{replyTo.mnic || "익명"}님께 답글 작성중
              <button className="ml-2 text-blue-600 underline" onClick={() => setReplyTo(null)}>취소</button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={cval}
              onChange={(e) => setCval(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addC(); } }}
              placeholder={replyTo ? "답글을 입력하세요" : "댓글을 입력하세요"}
              className="flex-1 border rounded p-2"
              rows={3}
            />
            <button onClick={addC} className="px-3 py-2 bg-pink-500 text-white rounded">
              {replyTo ? "답글 등록" : "등록"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-500">로그인 후 댓글을 작성할 수 있습니다.</div>
      )}
    </div>
  );
}
