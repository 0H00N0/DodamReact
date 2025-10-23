// src/pages/community/CommunityBoardForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { boardsApi } from "../../api/communityApi";
import { useAuth } from "../../contexts/AuthContext";
import { ensureCsrfCookie } from "../../utils/api"; // ✅ 유지

export default function CommunityBoardForm() {
  const { bnum } = useParams();
  const id = Number(bnum);
  const isEdit = Number.isFinite(id);
  const nav = useNavigate();
  const { user: currentUser } = useAuth() || {};

  const [form, setForm] = useState({ btitle: "", bcontent: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    boardsApi.get(id).then((p) =>
      setForm({
        btitle: p.btitle ?? p.bsub ?? "",
        bcontent: p.bcontent ?? "",
      })
    );
  }, [isEdit, id]);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!currentUser?.mid) {
      alert("로그인이 필요합니다.");
      return nav("/login");
    }
    if (!form.btitle || !form.bcontent) return alert("제목/내용을 입력하세요.");

    try {
      setBusy(true);

      // ✅ 상태 변경 전 쿠키/헤더 보장
      await ensureCsrfCookie();

      const payload = {
        btitle: form.btitle.trim(),
        bcontent: form.bcontent.trim(),
        bcanum: 3,
        mnum: currentUser.mnum,
        mtnum: currentUser.mtnum ?? 1,
        mid: currentUser.mid,
        mnic: currentUser.mnic || currentUser.nickname || "익명",
      };

      if (isEdit) {
        await boardsApi.update(id, payload);   // 세션 인증으로 서버가 판별
        nav(`/board/community/${id}`);
      } else {
        const created = await boardsApi.create(payload); // Long or {bnum}
        const newId = created?.bnum ?? created?.id ?? created;
        nav(`/board/community/${newId}`);
      }
    } catch (e2) {
      alert(`저장 실패: ${e2.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-2 text-sm">
        <Link to="/board/community" className="underline">목록</Link> / {isEdit ? "수정" : "작성"}
      </div>
      <h2 className="text-xl font-bold mb-4">{isEdit ? "게시글 수정" : "게시글 작성"}</h2>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <span className="w-24 text-sm text-gray-600">제목</span>
          <input
            name="btitle"
            value={form.btitle}
            onChange={onChange}
            placeholder="제목"
            className="border p-2 rounded flex-1"
            required
          />
        </label>

        <label className="flex gap-2">
          <span className="w-24 text-sm text-gray-600">내용</span>
          <textarea
            name="bcontent"
            value={form.bcontent}
            onChange={onChange}
            placeholder="내용"
            rows={12}
            className="border p-2 rounded flex-1"
            required
          />
        </label>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => nav(-1)} className="px-3 py-2 border rounded">
            취소
          </button>
          <button disabled={busy} className="px-3 py-2 bg-pink-500 text-white rounded">
            {busy ? "저장 중..." : (isEdit ? "수정 저장" : "등록")}
          </button>
        </div>
      </form>
    </div>
  );
}
