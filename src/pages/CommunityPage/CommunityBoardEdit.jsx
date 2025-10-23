import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { boardsApi } from "../../api/communityApi";
import { ensureCsrfCookie } from "../../utils/api"; // ✅ 추가
import styles from "./CommunityPage.module.css";

export default function CommunityBoardEdit({ currentUser }) {
  const { bnum } = useParams();
  const nav = useNavigate();

  const loc = useLocation();
  const initial = loc.state?.post;

  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ bcanum: "", bsub: "", bcontent: "" });
  const [busy, setBusy] = useState(false);

  // 카테고리 API가 없다면 이 useEffect는 제거하거나 고정 리스트로 대체하세요.
  useEffect(() => { boardsApi.categories?.().then?.(setCats); }, []);
  useEffect(() => {
    (initial ? Promise.resolve(initial) : boardsApi.get(bnum))
      .then((p) => setForm({ bcanum: p.bcanum, bsub: p.bsub, bcontent: p.bcontent }))
      .catch((e) => alert(e.message));
    // eslint-disable-next-line
  }, [bnum]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      // ✅ 상태 변경 전 CSRF 쿠키 확보
      await ensureCsrfCookie();

      await boardsApi.update(
        bnum,
        {
          bcanum: Number(form.bcanum),
          bsub: form.bsub,
          bcontent: form.bcontent,
        }
      );
      nav(`/board/community/${bnum}`);
    } catch (e2) {
      alert(`수정 실패: ${e2.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">글 수정</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <select
          value={form.bcanum}
          onChange={(e) => setForm((f) => ({ ...f, bcanum: e.target.value }))}
          required
          className="border p-2 rounded"
        >
          {cats.map((c) => (
            <option key={c.bcanum} value={c.bcanum}>{c.bcaname}</option>
          ))}
        </select>

        <input
          value={form.bsub}
          onChange={(e) => setForm((f) => ({ ...f, bsub: e.target.value }))}
          className="border p-2 rounded"
          required
        />
        <textarea
          value={form.bcontent}
          onChange={(e) => setForm((f) => ({ ...f, bcontent: e.target.value }))}
          rows={10}
          className="border p-2 rounded"
          required
        />

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => nav(-1)} className="px-3 py-2 border rounded">취소</button>
          <button disabled={busy} className="px-3 py-2 bg-pink-500 text-white rounded">
            {busy ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
