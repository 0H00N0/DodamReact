// src/member/Cash.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import "./MemberTheme.css";

export default function Cash() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/billing-keys");
        setMethods(Array.isArray(data) ? data : []);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          navigate("/member/login");
          return;
        }
        setErr("결제수단을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const goRegisterCard = () => {
    // 파라미터 없이도 CheckOut.jsx에서 기본값을 처리함
    navigate("/plan/checkout");
  };

  const goStartSubscribe = () => {
    // 원하면 특정 플랜 전달 가능: navigate("/plan/checkout/BASIC/1");
    navigate("/plan/checkout");
  };

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (err) return <div style={{ padding: 24, color: "tomato" }}>{err}</div>;

  // 간단한 스타일 (MemberTheme 톤 유지)
  const card = { background: "#fff", border: "1px solid #FFE3EE", borderRadius: 16, padding: 24 };
  const row = { marginTop: 16 };
  const btnBase = {
    padding: "16px 18px",
    borderRadius: 999,
    fontWeight: 800,
    letterSpacing: 0.2,
    fontSize: 16,
    width: "100%",
  };
  const btn = { ...btnBase, border: "1px solid #FFD1E5", background: "#fff", color: "#6F5663" };
  const btnPrimary = {
    ...btnBase,
    border: "none",
    background: "linear-gradient(180deg, #FFC8DB, #FFB3D0)",
    color: "#fff",
    boxShadow: "0 10px 20px rgba(255, 160, 200, 0.25)",
  };
  const btnDisabled = { opacity: 0.6, pointerEvents: "none" };

  return (
    <div className="member-page">
      <div className="m-card wide" style={card}>
        <h2 style={{ marginBottom: 16 }}>내 결제수단</h2>

        {methods.length === 0 ? (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: "1.5px dashed #FFD1E5",
              background: "#FFF6FA",
              color: "#9A8190",
              textAlign: "center",
            }}
          >
            등록된 결제수단이 없습니다. 아래에서 먼저 등록해 주세요.
          </div>
        ) : (
          <ul style={{ paddingLeft: 16 }}>
            {methods.map((m) => (
              <li key={m.id || m.payId || m.billingKey} style={{ marginBottom: 8 }}>
                {m.brand || m.pg || "카드"} •••• {m.last4 || "----"}
                {m.createdAt ? ` / 등록: ${m.createdAt}` : ""}
              </li>
            ))}
          </ul>
        )}

        {/* 버튼 영역 */}
        <div
          style={{
            ...row,
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: 10,
            marginTop: 24,
          }}
        >
          <button type="button" onClick={goRegisterCard} style={btn}>
            카드 등록
          </button>

          {/* 스샷처럼: 카드가 없으면 비활성화 */}
          <button
            type="button"
            onClick={goStartSubscribe}
            style={{ ...btnPrimary, ...(methods.length === 0 ? btnDisabled : {}) }}
            disabled={methods.length === 0}
          >
            구독 시작
          </button>
        </div>
      </div>
    </div>
  );
}
