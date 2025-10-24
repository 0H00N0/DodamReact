// src/pages/CommunityPage/CommunityBoardEdit.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { boardsApi } from "../../api/communityApi";
import { ensureCsrfCookie } from "../../utils/api";
import styles from "./CommunityPage.module.css";

export default function CommunityBoardEdit() {
  const { bnum } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const initial = loc.state?.post; // 목록/상세에서 넘어온 초기값(optional)

  // ✅ 분류 제거: 제목/내용만 관리
  const [form, setForm] = useState({ bsub: "", bcontent: "" });
  const [busy, setBusy] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    (initial ? Promise.resolve(initial) : boardsApi.get(bnum))
      .then((p) => setForm({
        bsub: p.bsub ?? p.btitle ?? "",
        bcontent: p.bcontent ?? "",
      }))
      .catch((e) => alert(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bnum]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await ensureCsrfCookie();
      // ✅ 분류는 수정하지 않음: 제목/내용만 보냄
      await boardsApi.update(bnum, {
        bsub: (form.bsub ?? "").trim(),
        bcontent: (form.bcontent ?? "").trim(),
      });
      nav(`/board/community/${bnum}`);
    } catch (e2) {
      alert(`수정 실패: ${e2.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h2 className={styles.panelTitle}>글 수정</h2>
      <form onSubmit={submit} className={styles.commForm}>
        {/* ✅ 분류 영역 제거 */}

        <div className="row">
          <label className={styles.pinkSubtle} style={{ width: 80 }}>제목</label>
          <input
            value={form.bsub}
            onChange={(e) => setForm((f) => ({ ...f, bsub: e.target.value }))}
            required
            className="input"
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="row">
          <label className={styles.pinkSubtle} style={{ width: 80 }}>내용</label>
          <textarea
            value={form.bcontent}
            onChange={(e) => setForm((f) => ({ ...f, bcontent: e.target.value }))}
            rows={10}
            required
            className="textarea"
            placeholder="내용을 입력하세요"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => nav(-1)} className="btn">취소</button>
          <button disabled={busy} className="btn primary">
            {busy ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </section>
  );
}
