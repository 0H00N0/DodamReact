import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { boardsApi } from "../../api/communityApi";
import { useAuth } from "../../contexts/AuthContext";

// 공백/ISO/배열 모두 파싱
const parseDate = (v) => {
  if (!v) return null;
  if (Array.isArray(v)) {
    const [y, m, d, hh = 0, mi = 0, ss = 0] = v;
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh, mi, ss);
    return isNaN(dt) ? null : dt;
  }
  const s = typeof v === "string" ? (v.includes("T") ? v : v.replace(" ", "T")) : v;
  const d = new Date(s);
  return isNaN(d) ? null : d;
};
const fmt = (value) => {
  const d = parseDate(value);
  if (!d) return "-";
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export default function CommunityBoardList() {
  const [qs, setQs] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth() || {};
  const actorMid = user?.mid;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const page = Number(qs.get("page") || 0);
  const size = Number(qs.get("size") || 15);
  const q = qs.get("q") || "";

  useEffect(() => {
    boardsApi
      .list({ page, size, bcanum: 3, q: q || undefined })
      .then((data) => {
        if (Array.isArray(data)) {
          setRows(data);
          setTotal(data.length);
        } else {
          setRows(data?.content ?? data?.rows ?? []);
          setTotal(data?.totalElements ?? data?.total ?? 0);
        }
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
      });
  }, [page, size, q]);

  const pages = useMemo(() => {
    const last = Math.max(0, Math.ceil(total / size) - 1);
    return { cur: page, last };
  }, [page, size, total]);

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = new URLSearchParams(qs);
    next.set("page", "0");
    next.set("q", (fd.get("q") || "").trim());
    setQs(next);
  };

  const onClickWrite = () => {
    if (!actorMid) {
      if (window.confirm("글쓰기는 로그인 후 이용 가능합니다. 로그인하시겠어요?")) {
        const next = encodeURIComponent(`/board/community/new`);
        nav(`/login?next=${next}`);
      }
      return;
    }
    nav("/board/community/new");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-3">커뮤니티 게시판</h2>

      <form className="flex gap-2 mb-3" onSubmit={submit}>
        <input
          name="q"
          defaultValue={q}
          placeholder="검색어"
          className="border rounded px-2 py-1 flex-1"
        />
        <button className="px-3 py-1 border rounded">검색</button>
        <div className="flex-1" />
        <button
          type="button"
          className="px-3 py-1 border rounded bg-pink-50"
          onClick={onClickWrite}
        >
          글쓰기
        </button>
      </form>

      <ul className="divide-y">
        {rows.map((it) => (
          <li key={it.bnum} className="py-3">
            <Link to={`/board/community/${it.bnum}`} className="block">
              <div className="font-medium">
                {it.bsub ?? it.btitle ?? it.title ?? it.subject ?? "(제목 없음)"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(it.mnic ?? it.nickname ?? it.mid) || "익명"} · {fmt(it.bdate ?? it.bcreatedAt ?? it.createdAt ?? it.regDate)}
                {!!it.commentCount && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full border">
                    💬 {it.commentCount}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}

        {rows.length === 0 && (
          <li className="py-8 text-center text-gray-500">게시글이 없습니다.</li>
        )}
      </ul>

      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page <= 0}
          onClick={() => setQs({ page: 0, size, q })}
        >
          처음
        </button>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page <= 0}
          onClick={() => setQs({ page: page - 1, size, q })}
        >
          이전
        </button>
        <span className="text-sm">
          {pages.cur + 1} / {pages.last + 1}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page >= pages.last}
          onClick={() => setQs({ page: page + 1, size, q })}
        >
          다음
        </button>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page >= pages.last}
          onClick={() => setQs({ page: pages.last, size, q })}
        >
          마지막
        </button>
      </div>
    </div>
  );
}
