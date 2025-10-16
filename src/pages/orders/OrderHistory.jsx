import React, { useEffect, useState } from "react";
import { fetchMyRents, cancelRent, exchangeRent, returnRent } from "../../Product/api/rentApi";
import { shipStatusLabel } from "../../utils/shipStatusLabel";

export default function OrderHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null); // { renNum, type:'EXCHANGE', newPronum:'', reason:'' }

  const reload = async () => {
    setLoading(true);
    try {
      const list = await fetchMyRents();
      setRows(list);
    } catch {
      setErr("주문내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  // 서버 DTO의 status가 'SHIPPING' | 'DELIVERED' 로 내려옴
  const canCancel = (r) => r.status === 'SHIPPING';
  const canExchange = (r) => r.status === 'SHIPPING';
  const canReturn = (r) => r.status === 'DELIVERED';

  const onCancel = async (r) => {
    if (!window.confirm("이 주문을 취소할까요?")) return;
    try {
      await cancelRent(r.rentNum);
      alert("취소되었습니다.");
      reload();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "취소 중 오류");
    }
  };

  const onExchange = (r) => setModal({ renNum: r.rentNum, type:'EXCHANGE', newPronum:'', reason:'' });

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

  const submitExchange = async () => {
    try {
      const p = Number(modal.newPronum);
      if (!p) return alert("교환할 상품 번호(pronum)를 입력하세요.");
      await exchangeRent(modal.renNum, p, modal.reason || "");
      alert("교환이 접수되었습니다.");
      setModal(null);
      reload();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "교환 요청 중 오류");
    }
  };

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (err) return <div style={{ padding: 24, color: 'crimson' }}>{err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>주문 내역</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>주문번호</th>
            <th>상품명</th>
            <th>상태</th>
            <th>주문일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.rentNum ?? `${r.pronum}-${r.rentDate}`}>
              <td style={{ padding: 8 }}>{r.rentNum ?? "-"}</td>
              <td style={{ padding: 8 }}>{r.productName}</td>
              <td style={{ padding: 8 }}>{shipStatusLabel(r.status)}</td>
              <td style={{ padding: 8 }}>
                {r.rentDate ? String(r.rentDate).replace("T"," ").slice(0,19) : "-"}
              </td>
              <td style={{ padding: 8 }}>
                {canCancel(r)   && <button onClick={() => onCancel(r)}>취소</button>}
                {canExchange(r) && <button onClick={() => onExchange(r)} style={{ marginLeft: 8 }}>교환</button>}
                {canReturn(r)   && <button onClick={() => onReturn(r)} style={{ marginLeft: 8 }}>반품</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 교환 모달 */}
      {modal && modal.type === 'EXCHANGE' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 420 }}>
            <h3>교환 요청</h3>
            <div style={{ marginTop: 12 }}>
              <label>교환 상품 번호(pronum)</label><br />
              <input
                value={modal.newPronum}
                onChange={e => setModal({ ...modal, newPronum: e.target.value })}
                placeholder="예) 101"
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label>사유(선택)</label><br />
              <textarea
                rows={4}
                value={modal.reason}
                onChange={e => setModal({ ...modal, reason: e.target.value })}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setModal(null)}>닫기</button>
              <button onClick={submitExchange}>요청 제출</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
