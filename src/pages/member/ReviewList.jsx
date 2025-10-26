import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";

import "./MemberTheme.css";

export default function ReviewList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/member/reviews/my", { withCredentials: true });
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e?.response?.status === 401) { navigate("/member/login"); return; }
        setErr("리뷰 목록을 불러오지 못했어요.");
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  if (loading) return <div style={{ padding: 24 }}>불러오는 중…</div>;
  if (err) return <div style={{ padding: 24, color: "crimson" }}>{err}</div>;
  if (rows.length === 0) {
    return <div style={{ padding: 24 }}><h2>내 리뷰</h2>아직 작성한 리뷰가 없어요.</div>;
  }

  const fmt = (v) => (v ? new Date(v).toLocaleString() : "");
  const stars = (n) => (n ? "★".repeat(Math.max(0, Math.min(5, n))) : "-");

  return (
    <div className="member-page">
      <div className="m-card">
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>내 리뷰</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 80px 140px 80px 120px",
        gap: 12, fontWeight: 600, padding: "10px 0", borderBottom: "1px solid #eee"
      }}>
        <div>상품/내용</div><div>평점</div><div>작성일</div><div>좋아요</div><div>공개여부</div>
      </div>

      {rows.map(r => (
        <div key={r.revnum} style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px 140px 80px 120px",
          gap: 12, padding: "12px 0", borderBottom: "1px solid #f2f2f2"
        }}>
          <div>
            <div style={{ fontWeight: 600 }}>
              {r.pronum
                ? <Link to={`/product/${r.pronum}`} style={{ textDecoration: "none" }}>
                    {r.proname ?? `상품 #${r.pronum}`}
                  </Link>
                : (r.proname ?? "상품")}
            </div>
            <div style={{ marginTop: 6, color: "#555", whiteSpace: "pre-wrap" }}>
              {r.revtitle ? `[${r.revtitle}] ` : ""}{r.revtext}
            </div>
          </div>
          <div>{stars(r.revscore)}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{fmt(r.revcre)}</div>
          <div>{r.revlike ?? 0}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {r.revstate ?? (r.revstatenum ? `#${r.revstatenum}` : "-")}
          </div>
        </div>
      ))}
    </div>
      </div>
    </div>
  );
}
