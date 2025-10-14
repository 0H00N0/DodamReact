import React, { useEffect, useState } from "react";
import { fetchMyRents } from "../../Product/api/rentApi";

export default function OrderHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchMyRents();
        setRows(list);
      } catch {
        setErr("주문내역을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (err) return <div style={{ padding: 24, color: "tomato" }}>{err}</div>;
  if (rows.length === 0) return <div style={{ padding: 24 }}>주문내역이 없습니다.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>주문내역</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>주문번호</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>상품명</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>상태</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>주문일</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.rentNum ?? `${r.pronum}-${r.rentDate}`}>
              <td style={{ padding: 8 }}>{r.rentNum ?? "-"}</td>
              <td style={{ padding: 8 }}>{r.productName}</td>
              <td style={{ padding: 8 }}>{r.status}</td>
              <td style={{ padding: 8 }}>{r.rentDate?.replace("T"," ").slice(0,19)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
