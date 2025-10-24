// src/pages/CommunityPage/CommunityBoardDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { boardsApi, commentsApi } from "../../api/communityApi";
import { useAuth } from "../../contexts/AuthContext";
import { ensureCsrfCookie } from "../../utils/api";
import styles from "./CommunityPage.module.css";

/* ---------------------------
 * 날짜 유틸
 * --------------------------*/
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

/* ---------------------------
 * 안전 문자열 유틸
 * --------------------------*/
const toTrimmedString = (v) => (typeof v === "string" ? v : String(v ?? "")).trim();

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
        nav(
          `/error?code=404&reason=${encodeURIComponent("게시글을 찾을 수 없습니다.")}`,
          { replace: true }
        );
      } else {
        nav(
          `/error?code=${code || 400}&reason=${encodeURIComponent(e.message || "요청 오류")}`,
          { replace: true }
        );
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [id]);

  const addC = async () => {
    if (!actorMid) return alert("로그인 후 댓글 작성 가능합니다.");
    const text = toTrimmedString(cval);
    if (!text) return;

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
      if (Array.isArray(c.children)) {
        const f = find(c.children);
        if (f) return f;
      }
    }
    return null;
  };
  const curr = find(comments)?.ccontent ?? "";
  const next = await window.prompt("댓글 수정", curr); // ✅ 비동기 프롬프트는 반드시 await
  if (next == null) return;

  const text = (typeof next === "string" ? next : String(next ?? "")).trim();
  if (!text) return;

  await ensureCsrfCookie();
  await commentsApi.update(id, conum, { ccontent: text });
  setComments(await commentsApi.list(id));
};

  const delC = async (conum) => {
  const ok = await window.confirm("댓글을 삭제할까요?");
  if (!ok) return;

  await ensureCsrfCookie();
  try {
    await commentsApi.remove(id, conum);
  } catch (err) {
    const raw = String(err?.message || "");
    const msg = /삭제할 수 없습니다|constraint|foreign|child|children|integrity/i.test(raw)
      ? "답글이 있어 삭제할 수 없습니다."
      : raw || "삭제 중 오류가 발생했습니다.";
    alert(msg);
  }
  setComments(await commentsApi.list(id));
};

  if (loading) return <div className={styles.loading}>로딩중…</div>;
  if (!post) return <div className={styles.empty}>게시글을 찾을 수 없습니다.</div>;

  const author = post.mnic ?? post.nickname ?? post.mid ?? "익명";
  const dateLabel = buildDateLabel(post.bdate, post.bedate);

  const CommentItem = ({ c, depth = 0 }) => (
    <li
      className={styles.commentItem}
      style={{ marginLeft: depth > 0 ? 12 : 0 }}
    >
      <div className={styles.commentHead}>
        <span className="badge">{(c.mnic ?? c.mid) || "익명"}</span>
        <span className={styles.pinkSubtle}>
          {buildDateLabel(c.cdate, c.cedate)}
        </span>
      </div>
      <div className="comment-body">{c.ccontent}</div>
      <div className={styles.detailActions}>
        <button
          type="button"
          className="btn"
          onClick={() => setReplyTo({ conum: c.conum, mnic: c.mnic ?? c.mid })}
        >
          답글
        </button>
        {(c?.mine || actorMid === c?.mid) && (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => editC(c.conum)}
            >
              수정
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => delC(c.conum)}
            >
              삭제
            </button>
          </>
        )}
      </div>
      {Array.isArray(c.children) && c.children.length > 0 && (
        <ul className="space-y-3 mt-3">
          {c.children.map((ch) => (
            <CommentItem key={ch.conum} c={ch} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <section>
      <div className={styles.detailSub}>
        <Link to="/board/community" className={styles.titleLink}>
          ← 목록
        </Link>
      </div>

      <h2 className={styles.panelTitle}>
        {post.bsub ?? post.btitle ?? "(제목 없음)"}
      </h2>
      <div className={styles.pinkSubtle}>
        {author} · {dateLabel}
      </div>

      <article
        className={`${styles.commContent} ${styles.pinkCard}`}
        style={{ marginTop: 12 }}
      >
        {post.bcontent}
      </article>

      {(post?.mine || actorMid === post?.mid) && (
        <div className={styles.detailActions}>
          <Link to={`/board/community/${id}/edit`} className="btn">
            수정
          </Link>
          <button
            type="button"
            className="btn danger"
            onClick={async () => {
              const ok = await window.confirm("삭제할까요?");
              if (!ok) return;
              await ensureCsrfCookie();
              try {
                await boardsApi.remove(id);
                nav("/board/community");
              } catch (err) {
                alert(err?.message || "삭제 실패");
              }
            }}
          >
            삭제
          </button>
        </div>
      )}

      <h3 className="pink-title" style={{ marginTop: 20 }}>
        댓글 {comments.length}
      </h3>
      <ul className={styles.commentList}>
        {comments.map((c) => (
          <CommentItem key={c.conum} c={c} />
        ))}
        {comments.length === 0 && (
          <li className={styles.empty}>첫 댓글을 남겨보세요.</li>
        )}
      </ul>

      {actorMid ? (
        <div className="mt-3">
          {replyTo && (
            <div
              className={styles.pinkSubtle}
              style={{ marginBottom: 8 }}
            >
              @{replyTo.mnic || "익명"}님께 답글 작성중
              <button
                type="button"
                className="titleLink"
                style={{ marginLeft: 8 }}
                onClick={() => setReplyTo(null)}
              >
                취소
              </button>
            </div>
          )}
          <div className={styles.commentForm}>
            <textarea
              value={cval}
              onChange={(e) => setCval(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  await addC();
                }
              }}
              placeholder={replyTo ? "답글을 입력하세요" : "댓글을 입력하세요"}
              rows={3}
              className="textarea"
            />
            <div className="right">
              <button
                type="button"
                onClick={addC}
                className="btn primary"
              >
                {replyTo ? "답글 등록" : "등록"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.pinkSubtle} style={{ marginTop: 12 }}>
          로그인 후 댓글을 작성할 수 있습니다.
        </div>
      )}
    </section>
  );
}
