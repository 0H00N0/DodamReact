// src/pages/CommunityPage/CommunityBoardForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { boardsApi } from "../../api/communityApi";
import styles from "./CommunityPage.module.css";
// 선택 사항: 로그인 세션 확인이 필요하면 사용하세요.
// import { useAuth } from "../../contexts/AuthContext";

export default function CommunityBoardForm() {
  const { bnum } = useParams();
  const id = Number(bnum);
  const isEdit = Number.isFinite(id);
  const nav = useNavigate();
  // const { user } = useAuth() || {};

  const [form, setForm] = useState({ bsub: "", bcontent: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    boardsApi.get(id).then((p) =>
      setForm({
        bsub: p?.bsub ?? p?.btitle ?? "",
        bcontent: p?.bcontent ?? "",
      })
    );
  }, [isEdit, id]);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.bsub.trim() || !form.bcontent.trim()) {
      return alert("제목/내용을 입력하세요.");
    }

    try {
      setBusy(true);
      const payload = {
        bsub: form.bsub.trim(),
        bcontent: form.bcontent.trim(),
        bcanum: 3, // 백엔드 규약(커뮤니티 카테고리) 유지
      };

      let targetId = id;
      if (isEdit) {
        await boardsApi.update(id, payload);
      } else {
        const created = await boardsApi.create(payload);
        targetId = created?.bnum ?? created?.id ?? created;
      }
      nav(`/board/community/${targetId}`);
    } catch (err) {
      console.error("[board save] error", err);
      alert(`저장 실패: ${err?.message || "요청 오류"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className={styles.detailSub}>
        <Link to="/board/community" className={styles.titleLink}>
          ← 목록
        </Link>{" "}
        / {isEdit ? "게시글 수정" : "게시글 작성"}
      </div>

      <h2 className={styles.panelTitle}>
        {isEdit ? "게시글 수정" : "게시글 작성"}
      </h2>

      <form onSubmit={submit} className={styles.commForm}>
        <div className="row">
          <label className={styles.pinkSubtle} style={{ width: 80 }}>
            제목
          </label>
          <input
            name="bsub"
            value={form.bsub}
            onChange={onChange}
            placeholder="제목"
            className="input"
            required
          />
        </div>

        <div className="row">
          <label className={styles.pinkSubtle} style={{ width: 80 }}>
            내용
          </label>
          <textarea
            name="bcontent"
            value={form.bcontent}
            onChange={onChange}
            placeholder="내용"
            rows={12}
            className="textarea"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => nav(-1)} className="btn">
            취소
          </button>
          <button disabled={busy} className="btn primary">
            {busy ? "저장 중..." : isEdit ? "수정 저장" : "등록"}
          </button>
        </div>
      </form>
    </section>
  );
}
