import React, { useEffect, useState } from "react";
import { fetchMyRents, returnRent } from "../../Product/api/rentApi";
import { shipStatusLabel } from "../../utils/shipStatusLabel";

export default function OrderReturns() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      const list = await fetchMyRents();
      // ✅ 반품 가능: 배송완료만
      setRows(list.filter(r => r.status === "DELIVERED"));
    } catch {
      setErr("반품 가능한 주문을 불러오지 못했습니다.");
    } finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const onReturn = async (r) => {
    const reason = window.prompt("반품 사유를 입력하세요(선택)");
    try {
      await returnRent(r.rentNum, reason || "");
      alert("반품이 접수되었습니다.");
      reload();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "반품 요청 중 오류");
    }
  };

  if (loading) return <div style={{padding:24}}>불러오는 중...</div>;
  if (err) return <div style={{padding:24, color:'crimson'}}>{err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>반품 가능 목록</h2>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr><th>주문번호</th><th>상품명</th><th>상태</th><th>주문일</th><th>반품</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.rentNum}>
              <td style={{padding:8}}>{r.rentNum}</td>
              <td style={{padding:8}}>{r.productName}</td>
              <td style={{padding:8}}>{shipStatusLabel(r.status)}</td>
              <td style={{padding:8}}>{r.rentDate?.replace("T"," ").slice(0,19)}</td>
              <td style={{padding:8}}>
                <button onClick={()=>onReturn(r)}>반품</button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={5} style={{padding:16, textAlign:'center'}}>반품 가능한 주문이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
