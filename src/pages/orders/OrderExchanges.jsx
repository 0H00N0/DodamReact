import React, { useEffect, useState } from "react";
import { fetchMyRents, exchangeRent, cancelRent } from "../../Product/api/rentApi";
import { shipStatusLabel } from "../../utils/shipStatusLabel";
import ProductPickerModal from "../ProductPickerModal";

export default function OrderExchanges() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  // { renNum, newPronum:'', reason:'', origPronum }
  const [modal, setModal] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const list = await fetchMyRents();
      // ✅ 교환 가능: 배송중만
      setRows(list.filter(r => r.status === "SHIPPING"));
    } catch {
      setErr("교환 가능한 주문을 불러오지 못했습니다.");
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const onCancel = async (r) => {
    if (!window.confirm("이 주문을 취소할까요?")) return;
    try {
      await cancelRent(r.rentNum);
      alert("취소되었습니다.");
      reload();
    } catch (e) { alert(e?.response?.data?.message || e?.message || "취소 중 오류"); }
  };
  const onExchange = (r) => setModal({ renNum: r.rentNum, newPronum:'', reason:'', origPronum: r.pronum });
  const submitExchange = async () => {
    try {
      const p = Number(modal.newPronum);
      if (!p) return alert("교환할 상품 번호(pronum)를 입력하세요.");
      await exchangeRent(modal.renNum, p, modal.reason || "");
      alert("교환이 접수되었습니다.");
      setModal(null);
      reload();
    } catch (e) { alert(e?.response?.data?.message || e?.message || "교환 요청 중 오류"); }
  };

  if (loading) return <div style={{padding:24}}>불러오는 중...</div>;
  if (err) return <div style={{padding:24, color:'crimson'}}>{err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>교환 가능 목록</h2>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr><th>주문번호</th><th>상품명</th><th>상태</th><th>주문일</th><th>액션</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.rentNum}>
              <td style={{padding:8}}>{r.rentNum}</td>
              <td style={{padding:8}}>{r.productName}</td>
              <td style={{ padding: 8 }}>{shipStatusLabel(r.status)}</td>
              <td style={{padding:8}}>{r.rentDate?.replace("T"," ").slice(0,19)}</td>
              <td style={{padding:8}}>
                <button onClick={()=>onExchange(r)}>교환</button>
                <button onClick={()=>onCancel(r)} style={{marginLeft:8}}>취소</button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={5} style={{padding:16, textAlign:'center'}}>교환 가능한 주문이 없습니다.</td></tr>
          )}
        </tbody>
      </table>

      {/* 교환 모달 */}
      {modal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.4)',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <div style={{ background:'#fff', padding:20, borderRadius:8, width:420 }}>
            <h3>교환 요청</h3>
            <div style={{marginTop:12}}>
              <label>교환 상품 번호(pronum)</label><br/>
              <div style={{ position:'relative' }}>
                <input
                  value={modal.newPronum}
                  onChange={e=>setModal({...modal, newPronum:e.target.value})}
                  placeholder="예) 101"
                  style={{width:'100%', padding:'8px 96px 8px 8px', boxSizing:'border-box'}}
                />
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  style={{
                    position:'absolute', right:4, top:4, bottom:4,
                    padding:'0 12px', border:'1px solid #ddd',
                    borderRadius:8, background:'#f9fafb', cursor:'pointer'
                  }}
                >
                  상품 선택
                </button>
              </div>
            </div>
            <div style={{marginTop:12}}>
              <label>사유(선택)</label><br/>
              <textarea rows={4} value={modal.reason}
                        onChange={e=>setModal({...modal, reason:e.target.value})}
                        style={{width:'100%', padding:8}}/>
            </div>
            <div style={{marginTop:16, display:'flex', justifyContent:'flex-end', gap:8}}>
              <button onClick={()=>setModal(null)}>닫기</button>
              <button onClick={submitExchange}>요청 제출</button>
            </div>
          </div>
        </div>
      )}

      {/* 상품 선택 모달 */}
      {modal && (
        <ProductPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(p) => {
            setModal(m => ({ ...m, newPronum: p.pronum }));
            setPickerOpen(false);
          }}
          excludePronum={modal.origPronum}  // ✅ 원래 상품은 목록에서 숨김
          title="교환할 상품 선택"
        />
      )}
    </div>
  );
}
