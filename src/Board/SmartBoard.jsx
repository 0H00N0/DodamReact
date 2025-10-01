// SmartBoard.jsx — 단일 파일로 붙여넣어 바로 사용하는 리액트 UI (Tailwind 사용)
// - 탭: 공지, 커뮤니티, FAQ, 문의, 이벤트
// - 기능: 검색, 정렬, 페이지네이션, 태그, 좋아요, 상세/작성 모달, FAQ 아코디언, 문의 폼, 이벤트 카드
// - 모의 저장: localStorage (USE_MOCK=true). Spring Boot 연동시 USE_MOCK=false 로 바꾸고 BASE_URL 수정.

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/*** ▼▼ 환경 설정 ▼▼ ***/
const USE_MOCK = true; // 실제 백엔드(/api) 연동 시 false 로 변경
const BASE_URL = "http://localhost:8080/api"; // Spring Boot 기본 예시

/*** ▼▼ 유틸 ***/
const fmtDate = (d) => new Date(d).toLocaleString();
const uid = () => Math.random().toString(36).slice(2, 10);

/*** ▼▼ 로컬스토리지 모의 DB ***/
const LS_KEYS = {
  Notice: "smartboard_Notice",
  faqs: "smartboard_faqs",
  inquiries: "smartboard_inquiries",
};

function ensureSeed() {
  if (!localStorage.getItem(LS_KEYS.Notice)) {
    const now = Date.now();
    const seed = [
      {
        id: uid(),
        board: "NOTICE",
        title: "[공지] 시스템 점검 안내 (9/5 02:00-04:00)",
        author: "관리자",
        content:
          "안정적인 서비스 제공을 위해 9/5(금) 02:00-04:00 시스템 점검이 진행됩니다.",
        tags: ["점검", "공지"],
        views: 122,
        likes: 9,
        createdAt: now - 1000 * 60 * 60 * 48,
        updatedAt: now - 1000 * 60 * 60 * 24,
      },
      {
        id: uid(),
        board: "COMMUNITY",
        title: "장난감 구독 추천 받아요!",
        author: "parkjg",
        content:
          "5세 아기에게 맞는 구독 추천 부탁드립니다. 소근육/창의력 위주면 좋아요.",
        tags: ["추천", "구독"],
        views: 87,
        likes: 4,
        createdAt: now - 1000 * 60 * 60 * 12,
        updatedAt: now - 1000 * 60 * 60 * 11,
      },
      {
        id: uid(),
        board: "EVENT",
        title: "가을 맞이 구독 20% 할인 이벤트 (9/1~9/15)",
        author: "운영팀",
        content:
          "가을 한정 구독 20% 할인! 신규/재구독 모두 적용됩니다. 자세한 내용은 본문.",
        tags: ["할인", "가을"],
        views: 301,
        likes: 18,
        eventStart: now - 1000 * 60 * 60 * 24 * 1,
        eventEnd: now + 1000 * 60 * 60 * 24 * 13,
        createdAt: now - 1000 * 60 * 60 * 30,
        updatedAt: now - 1000 * 60 * 60 * 1,
      },
    ];
    localStorage.setItem(LS_KEYS.Notice, JSON.stringify(seed));
  }
  if (!localStorage.getItem(LS_KEYS.faqs)) {
    const seed = [
      {
        id: uid(),
        q: "구독 일시정지 가능한가요?",
        a: "네, 마이페이지 > 구독관리에서 1~3개월 범위로 일시정지가 가능합니다.",
      },
      {
        id: uid(),
        q: "결제 수단 변경은 어떻게 하나요?",
        a: "마이페이지 > 결제수단에서 새로운 카드를 등록 후 기본으로 설정하세요.",
      },
    ];
    localStorage.setItem(LS_KEYS.faqs, JSON.stringify(seed));
  }
  if (!localStorage.getItem(LS_KEYS.inquiries)) {
    localStorage.setItem(LS_KEYS.inquiries, JSON.stringify([]));
  }
}

/*** ▼▼ API (모의/실제) ***/
const api = {
  async listPosts({ board, q = "", sort = "new", page = 1, size = 10 }) {
    if (USE_MOCK) {
      const all = JSON.parse(localStorage.getItem(LS_KEYS.Notice) || "[]");
      let rows = board ? all.filter((p) => p.board === board) : all;
      if (q) {
        const t = q.toLowerCase();
        rows = rows.filter(
          (p) =>
            p.title.toLowerCase().includes(t) ||
            p.content.toLowerCase().includes(t) ||
            (p.tags || []).some((tag) => tag.toLowerCase().includes(t))
        );
      }
      if (sort === "new") rows.sort((a, b) => b.createdAt - a.createdAt);
      if (sort === "view") rows.sort((a, b) => b.views - a.views);
      if (sort === "like") rows.sort((a, b) => b.likes - a.likes);
      const total = rows.length;
      const start = (page - 1) * size;
      const data = rows.slice(start, start + size);
      return { data, total };
    } else {
      const url = new URL(`${BASE_URL}/posts`);
      if (board) url.searchParams.set("board", board);
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("sort", sort);
      url.searchParams.set("page", String(page));
      url.searchParams.set("size", String(size));
      const res = await fetch(url);
      if (!res.ok) throw new Error("목록 조회 실패");
      return res.json();
    }
  },
  async getPost(id) {
    if (USE_MOCK) {
      const all = JSON.parse(localStorage.getItem(LS_KEYS.Notice) || "[]");
      const found = all.find((p) => p.id === id);
      if (found) {
        // 조회수 증가
        found.views = (found.views || 0) + 1;
        localStorage.setItem(LS_KEYS.posts, JSON.stringify(all));
      }
      return found;
    } else {
      const res = await fetch(`${BASE_URL}/posts/${id}`);
      if (!res.ok) throw new Error("조회 실패");
      return res.json();
    }
  },
  async createPost(payload) {
    if (USE_MOCK) {
      const all = JSON.parse(localStorage.getItem(LS_KEYS.Notice) || "[]");
      const now = Date.now();
      const row = {
        ...payload,
        id: uid(),
        views: 0,
        likes: 0,
        createdAt: now,
        updatedAt: now,
      };
      all.unshift(row);
      localStorage.setItem(LS_KEYS.posts, JSON.stringify(all));
      return row;
    } else {
      const res = await fetch(`${BASE_URL}/Notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("작성 실패");
      return res.json();
    }
  },
  async updatePost(id, payload) {
    if (USE_MOCK) {
      const all = JSON.parse(localStorage.getItem(LS_KEYS.Notice) || "[]");
      const idx = all.findIndex((p) => p.id === id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...payload, updatedAt: Date.now() };
        localStorage.setItem(LS_KEYS.Notice, JSON.stringify(all));
        return all[idx];
      }
      throw new Error("존재하지 않는 글");
    } else {
      const res = await fetch(`${BASE_URL}/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("수정 실패");
      return res.json();
    }
  },
  async likePost(id) {
    if (USE_MOCK) {
      const all = JSON.parse(localStorage.getItem(LS_KEYS.Notice) || "[]");
      const idx = all.findIndex((p) => p.id === id);
      if (idx >= 0) {
        all[idx].likes = (all[idx].likes || 0) + 1;
        localStorage.setItem(LS_KEYS.posts, JSON.stringify(all));
        return all[idx];
      }
      throw new Error("존재하지 않는 글");
    } else {
      const res = await fetch(`${BASE_URL}/posts/${id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("좋아요 실패");
      return res.json();
    }
  },
  async listFaqs() {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem(LS_KEYS.faqs) || "[]");
    } else {
      const res = await fetch(`${BASE_URL}/faqs`);
      if (!res.ok) throw new Error("FAQ 조회 실패");
      return res.json();
    }
  },
  async createInquiry(payload) {
    if (USE_MOCK) {
      const all = JSON.parse(localStorage.getItem(LS_KEYS.inquiries) || "[]");
      const row = { id: uid(), createdAt: Date.now(), status: "RECEIVED", ...payload };
      all.unshift(row);
      localStorage.setItem(LS_KEYS.inquiries, JSON.stringify(all));
      return row;
    } else {
      const res = await fetch(`${BASE_URL}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("문의 등록 실패");
      return res.json();
    }
  },
};

if (USE_MOCK) ensureSeed();

/*** ▼▼ 공용 UI 컴포넌트 ***/
function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-700 dark:text-gray-200">
      {children}
    </span>
  );
}

function Badge({ children, tone = "blue" }) {
  const toneClass = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
  }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-xs ${toneClass}`}>{children}</span>;
}

function Empty({ title = "데이터가 없습니다", desc = "조건을 바꿔보세요." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="text-3xl">🗂️</div>
      <div className="text-base font-medium">{title}</div>
      <div className="text-sm text-gray-500">{desc}</div>
    </div>
  );
}

/*** ▼▼ 메인: SmartBoard ***/
export default function SmartBoard() {
  const [tab, setTab] = useState("NOTICE"); // NOTICE | COMMUNITY | FAQ | INQUIRY | EVENT

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Header />

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { key: "NOTICE", label: "공지사항" },
            { key: "COMMUNITY", label: "커뮤니티" },
            { key: "FAQ", label: "FAQ" },
            { key: "INQUIRY", label: "문의" },
            { key: "EVENT", label: "이벤트" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-2xl px-4 py-2 text-sm shadow-sm transition ${
                tab === t.key
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white/70 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white/80 p-4 shadow-xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
          {tab === "NOTICE" && <PostList board="NOTICE" allowWrite title="공지사항" />}
          {tab === "COMMUNITY" && <PostList board="COMMUNITY" allowWrite title="커뮤니티" />}
          {tab === "FAQ" && <FaqPanel />}
          {tab === "INQUIRY" && <InquiryPanel />}
          {tab === "EVENT" && <EventPanel />}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs tracking-widest text-gray-500">LUX • SMART • BOARD</div>
        <h1 className="mt-1 text-2xl font-bold">스마트 게시판</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          검색 · 정렬 · 태그 · 좋아요 · FAQ · 문의 · 이벤트, 한 화면에서 관리
        </p>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 px-4 py-2 text-sm text-white shadow-lg">
        React UI
      </div>
    </div>
  );
}

/*** ▼▼ 공지/커뮤니티 공용 리스트 ***/
function PostList({ board, title, allowWrite }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailId, setDetailId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const pageCount = Math.ceil(total / size);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, total } = await api.listPosts({ board, q, sort, page, size });
      setRows(data);
      setTotal(total);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, q, sort, page, size]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-lg font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          <input
            className="w-48 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            placeholder="검색 (제목/내용/태그)"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
          <select
            className="rounded-xl border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="new">최신순</option>
            <option value="view">조회순</option>
            <option value="like">좋아요순</option>
          </select>
          <select
            className="rounded-xl border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800"
            value={size}
            onChange={(e) => {
              setPage(1);
              setSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30].map((n) => (
              <option key={n} value={n}>
                {n}개씩
              </option>
            ))}
          </select>
          {allowWrite && (
            <button
              onClick={() => setShowEditor(true)}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white shadow hover:opacity-90 dark:bg-white dark:text-gray-900"
            >
              새 글쓰기
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">태그</th>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">조회</th>
              <th className="px-4 py-3">좋아요</th>
              <th className="px-4 py-3">작성일</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <Empty />
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40">
                  <td className="cursor-pointer px-4 py-3" onClick={() => setDetailId(row.id)}>
                    <div className="line-clamp-1 font-medium">{row.title}</div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">{row.content}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(row.tags || []).map((t) => (
                        <Chip key={t}>#{t}</Chip>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.author}</td>
                  <td className="px-4 py-3">{row.views ?? 0}</td>
                  <td className="px-4 py-3">{row.likes ?? 0}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(row.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">총 {total}건</div>
        <Pagination page={page} pageCount={pageCount} onPage={setPage} />
      </div>

      {detailId && (
        <PostDetailModal id={detailId} onClose={() => setDetailId(null)} onUpdated={refresh} />
      )}
      {showEditor && (
        <PostEditorModal
          board={board}
          onClose={() => setShowEditor(false)}
          onSaved={(row) => {
            setShowEditor(false);
            setPage(1);
            refresh();
          }}
        />
      )}
      {error && (
        <div className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40">
          {error}
        </div>
      )}
    </div>
  );
}

function Pagination({ page, pageCount, onPage }) {
  const items = useMemo(() => {
    const out = [];
    const max = Math.max(1, pageCount);
    const start = Math.max(1, page - 2);
    const end = Math.min(max, start + 4);
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }, [page, pageCount]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-700"
        disabled={page <= 1}
      >
        이전
      </button>
      {items.map((i) => (
        <button
          key={i}
          onClick={() => onPage(i)}
          className={`rounded-lg px-3 py-1 text-sm ${
            i === page
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "border dark:border-gray-700"
          }`}
        >
          {i}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-700"
        disabled={page >= pageCount}
      >
        다음
      </button>
    </div>
  );
}

/*** ▼▼ 상세 ***/
function PostDetailModal({ id, onClose, onUpdated }) {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await api.getPost(id);
    setRow(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="py-12 text-center text-gray-500">로딩...</div>
        ) : edit ? (
          <PostEditor
            initial={row}
            onCancel={() => setEdit(false)}
            onSubmit={async (payload) => {
              await api.updatePost(row.id, payload);
              await load();
              onUpdated?.();
              setEdit(false);
            }}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{row.title}</h3>
              <button
                className="rounded-xl bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={onClose}
              >
                닫기
              </button>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>작성자 {row.author}</span>
              <span>·</span>
              <span>작성 {fmtDate(row.createdAt)}</span>
              <span>·</span>
              <span>조회 {row.views ?? 0}</span>
              <span>·</span>
              <span>좋아요 {row.likes ?? 0}</span>
              {row.board === "EVENT" && (
                <>
                  <span>·</span>
                  <Badge tone={eventTone(row)}>{eventLabel(row)}</Badge>
                </>
              )}
            </div>
            <div className="prose prose-sm mt-4 max-w-none dark:prose-invert">
              <p style={{ whiteSpace: "pre-line" }}>{row.content}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {(row.tags || []).map((t) => (
                <Chip key={t}>#{t}</Chip>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await api.likePost(row.id);
                    await load();
                    onUpdated?.();
                  }}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-gray-900"
                >
                  👍 좋아요
                </button>
                <button
                  onClick={() => setEdit(true)}
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  ✏️ 수정
                </button>
              </div>
              <div className="text-xs text-gray-500">최근 수정 {fmtDate(row.updatedAt)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/*** ▼▼ 작성/수정 ***/
function PostEditorModal({ board, onClose, onSaved }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">새 글쓰기</h3>
          <button
            className="rounded-xl bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <PostEditor
          initial={{ board, title: "", content: "", tags: [], author: "user" }}
          onCancel={onClose}
          onSubmit={async (payload) => {
            const saved = await api.createPost(payload);
            onSaved?.(saved);
          }}
        />
      </div>
    </div>
  );
}

function PostEditor({ initial, onCancel, onSubmit }) {
  const [title, setTitle] = useState(initial.title || "");
  const [content, setContent] = useState(initial.content || "");
  const [tagsRaw, setTagsRaw] = useState((initial.tags || []).join(", "));
  const [author, setAuthor] = useState(initial.author || "user");
  const [board, setBoard] = useState(initial.board || "COMMUNITY");
  const [saving, setSaving] = useState(false);

  const canSubmit = title.trim().length >= 2 && content.trim().length >= 3;

  return (
    <form
      className="mt-3 grid grid-cols-1 gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSaving(true);
        try {
          const payload = {
            board,
            title: title.trim(),
            content: content.trim(),
            tags: tagsRaw
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            author: author || "user",
          };
          await onSubmit?.(payload);
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="md:col-span-1 text-sm text-gray-500">게시판</label>
        <div className="md:col-span-3">
          <select
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800"
            value={board}
            onChange={(e) => setBoard(e.target.value)}
          >
            <option value="NOTICE">공지사항</option>
            <option value="COMMUNITY">커뮤니티</option>
            <option value="EVENT">이벤트</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="md:col-span-1 text-sm text-gray-500">제목</label>
        <div className="md:col-span-3">
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="md:col-span-1 text-sm text-gray-500">내용</label>
        <div className="md:col-span-3">
          <textarea
            className="h-40 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="md:col-span-1 text-sm text-gray-500">태그</label>
        <div className="md:col-span-3">
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="예: 공지, 점검"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="md:col-span-1 text-sm text-gray-500">작성자</label>
        <div className="md:col-span-3">
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="표시명"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          취소
        </button>
        <button
          disabled={!canSubmit || saving}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-gray-900"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

/*** ▼▼ FAQ ***/
function FaqPanel() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.listFaqs().then(setRows);
  }, []);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return rows.filter((r) => r.q.toLowerCase().includes(t) || r.a.toLowerCase().includes(t));
  }, [rows, q]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold">FAQ</div>
        <input
          className="w-56 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          placeholder="FAQ 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="divide-y rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        {filtered.length === 0 && <Empty title="FAQ가 없습니다" />}
        {filtered.map((row) => (
          <details key={row.id} className="group">
            <summary className="cursor-pointer list-none px-4 py-3 font-medium group-open:bg-gray-50 dark:group-open:bg-gray-800/60">
              {row.q}
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm text-gray-700 dark:text-gray-200">{row.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

/*** ▼▼ 문의 ***/
function InquiryPanel() {
  const [form, setForm] = useState({ name: "", email: "", title: "", content: "", agree: false });
  const [done, setDone] = useState(null);
  const [sending, setSending] = useState(false);

  const canSubmit =
    form.name.trim() &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.title.trim().length >= 2 &&
    form.content.trim().length >= 5 &&
    form.agree;

  async function submit() {
    setSending(true);
    try {
      const saved = await api.createInquiry({ ...form });
      setDone(saved);
      setForm({ name: "", email: "", title: "", content: "", agree: false });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <div className="text-lg font-semibold">문의하기</div>
        <div className="mt-3 space-y-3">
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            placeholder="이름"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            placeholder="이메일"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            placeholder="제목"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            className="h-32 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            placeholder="문의 내용"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))}
            />
            개인정보 처리방침에 동의합니다.
          </label>
          <div className="flex justify-end">
            <button
              disabled={!canSubmit || sending}
              onClick={submit}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-gray-900"
            >
              {sending ? "전송 중..." : "문의 등록"}
            </button>
          </div>
          {done && (
            <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30">
              접수되었습니다. (ID: {done.id}) — 접수시간 {fmtDate(done.createdAt)}
            </div>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="text-sm text-gray-500">안내</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-200">
          <li>운영시간: 09:00 ~ 18:00 (주말/공휴일 제외)</li>
          <li>민감 정보(주민등록번호 등)는 절대 기재하지 마세요.</li>
          <li>처리 결과는 등록하신 이메일로 안내됩니다.</li>
        </ul>
      </div>
    </div>
  );
}

/*** ▼▼ 이벤트 ***/
function EventPanel() {
  const [page, setPage] = useState(1);
  const [size] = useState(9);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / size);

  const load = async () => {
    const { data, total } = await api.listPosts({ board: "EVENT", page, size, sort: "new" });
    setRows(data);
    setTotal(total);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold">이벤트</div>
      </div>
      {rows.length === 0 ? (
        <Empty title="진행 중인 이벤트가 없습니다" />)
       : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {rows.map((ev) => (
            <div key={ev.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold line-clamp-1">{ev.title}</div>
                <Badge tone={eventTone(ev)}>{eventLabel(ev)}</Badge>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {ev.eventStart && ev.eventEnd ? (
                  <span>
                    {new Date(ev.eventStart).toLocaleDateString()} ~ {new Date(ev.eventEnd).toLocaleDateString()}
                  </span>
                ) : (
                  <span>기간 미정</span>
                )}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-gray-700 dark:text-gray-200">{ev.content}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>조회 {ev.views ?? 0} · 좋아요 {ev.likes ?? 0}</span>
                <span>{(ev.tags || []).slice(0, 2).map((t) => `#${t}`).join(" ")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Pagination page={page} pageCount={pageCount} onPage={setPage} />
      </div>
    </div>
  );
}

function eventLabel(ev) {
  const now = Date.now();
  if (ev.eventStart && ev.eventEnd) {
    if (now < ev.eventStart) return "예정";
    if (now >= ev.eventStart && now <= ev.eventEnd) return "진행중";
    return "종료";
  }
  return "진행";
}
function eventTone(ev) {
  const l = eventLabel(ev);
  return l === "진행중" ? "green" : l === "예정" ? "violet" : l === "gray" ? "gray" : "amber";
}
