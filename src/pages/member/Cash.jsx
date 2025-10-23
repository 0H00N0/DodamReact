import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function Cash() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // 백엔드에 이미 있는 엔드포인트 (zip에서 확인)
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

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (err) return <div style={{ padding: 24, color: "tomato" }}>{err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>내 결제수단</h2>

      {methods.length === 0 ? (
        <div>등록된 결제수단이 없습니다.</div>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {methods.map((m) => (
            <li key={m.id} style={{ marginBottom: 8 }}>
              {m.brand || m.pg || "카드"} •••• {m.last4 || "----"}
              {m.createdAt ? ` / 등록: ${m.createdAt}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
