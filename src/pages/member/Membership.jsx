import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function Membership() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/member/subscriptions/my");
        setSubs(Array.isArray(data) ? data : []);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          // 비로그인 → 로그인 화면 유도 (필요 시 경로 수정)
          navigate("/member/login");
          return;
        }
        setErr("구독 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (err) return <div style={{ padding: 24, color: "tomato" }}>{err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>내 구독</h2>

      {subs.length === 0 ? (
        <div>활성화된 구독이 없습니다.</div>
      ) : (
        subs.map((s) => (
          <div
            key={s.pmId}
            style={{
              border: "1px solid #444",
              borderRadius: 12,
              padding: 16,
              margin: "12px 0",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {s.planName || "구독상품"} {s.planCode ? `(${s.planCode})` : ""}
            </div>
            <div>상태: {s.status}</div>
            <div>
              이용기간:{" "}
              {s.termLabel ?? (s.termMonth != null ? `${s.termMonth}개월` : "-")}
            </div>
            <div>
              기간: {s.termStart ?? "-"} ~ {s.termEnd ?? "-"}
            </div>
            <div>다음 결제일: {s.nextBillingAt ?? "-"}</div>
            <div>
              결제수단: {s.cardBrand ?? "-"} •••• {s.cardLast4 ?? "----"}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
