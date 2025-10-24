import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { boardsApi } from "../../api/communityApi";
import { useAuth } from "../../contexts/AuthContext";
import { ensureCsrfCookie } from "../../utils/api";
import styles from "./CommunityPage.module.css";

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

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!currentUser?.mid) {
      alert("로그인이 필요합니다.");
      return nav("/login");
    }
    if (!form.btitle || !form.bcontent) return alert("제목/내용을 입력하세요.");

    try {
      setBusy(true);
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
        await boardsApi.update(id, payload);
        nav(`/board/community/${id}`);
      } else {
        const created = await boardsApi.create(payload);
        const newId = created?.bnum ?? created?.id ?? created;
        nav(`/board/community/${newId}`);
      }
    } catch (e2) {
      alert(`저장 실패: ${e2.message}`);
    } finally { setBusy(false); }
  };

  return (
    <section>
      <div className={styles.detailSub}>
        <Link to="/board/community" className={styles.titleLink}>← 목록</Link> / {isEdit ? "수정" : "작성"}
      </div>

      <h2 className={styles.panelTitle}>{isEdit ? "게시글 수정" : "게시글 작성"}</h2>

      <form onSubmit={submit} className={styles.commForm}>
        <div className="row">
          <label className={styles.pinkSubtle} style={{ width: 80 }}>제목</label>
          <input
            name="btitle"
            value={form.btitle}
            onChange={onChange}
            placeholder="제목"
            className="input"
            required
          />
        </div>

        <div className="row">
          <label className={styles.pinkSubtle} style={{ width: 80 }}>내용</label>
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
          <button type="button" onClick={() => nav(-1)} className="btn">취소</button>
          <button disabled={busy} className="btn primary">
            {busy ? "저장 중..." : (isEdit ? "수정 저장" : "등록")}
          </button>
        </div>
      </form>
    </section>
  );
}
