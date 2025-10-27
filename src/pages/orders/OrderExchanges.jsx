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

  if (loading) return <div className="member-page"><div className="m-card">불러오는 중...</div></div>;
  if (err) return <div className="member-page"><div className="m-card m-error">{err}</div></div>;

  return (
    <div className="member-page">
      <div className="m-card wide">
        <h2 className="m-title">교환 가능 목록</h2>

        <div style={{overflowX:"auto"}}>
          <table className="m-table">
            <thead>
              <tr><th>주문번호</th><th>상품명</th><th>상태</th><th>주문일</th><th>액션</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.rentNum}>
                  <td>{r.rentNum}</td>
                  <td>{r.productName}</td>
                  <td>{shipStatusLabel(r.status)}</td>
                  <td>{r.rentDate?.replace("T"," ").slice(0,19)}</td>
                  <td>
                    <div className="m-actions">
                      <button className="m-btn" onClick={()=>onExchange(r)}>교환</button>
                      <button className="m-btn ghost" onClick={()=>onCancel(r)}>취소</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={5} style={{textAlign:'center'}}>교환 가능한 주문이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 교환 모달 */}
      {modal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.35)', display:'grid', placeItems:'center', zIndex:9999}}>
          <div className="m-card wide" style={{width:420, maxWidth:'92vw'}}>
            <h3 className="m-title">교환 요청</h3>

            <div className="m-form" style={{marginTop:8}}>
              <div className="m-row">
                <label className="m-label">교환 상품 번호(pronum)</label>
                <div style={{position:'relative'}}>
                  <input
                    className="m-input"
                    value={modal.newPronum}
                    onChange={e=>setModal({...modal, newPronum:e.target.value})}
                    placeholder="예) 101"
                    style={{paddingRight:106}}
                  />
                  <button
                    type="button"
                    className="m-btn ghost"
                    onClick={() => setPickerOpen(true)}
                    style={{position:'absolute', right:6, top:6, bottom:6}}
                  >
                    상품 선택
                  </button>
                </div>
              </div>

              <div className="m-row">
                <label className="m-label">사유(선택)</label>
                <textarea
                  className="m-textarea"
                  rows={4}
                  value={modal.reason}
                  onChange={e=>setModal({...modal, reason:e.target.value})}
                  placeholder="교환 사유를 입력하세요"
                />
              </div>

              <div className="m-actions" style={{justifyContent:'flex-end'}}>
                <button className="m-btn ghost" onClick={()=>setModal(null)}>닫기</button>
                <button className="m-btn" onClick={submitExchange}>요청 제출</button>
              </div>
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
          excludePronum={modal.origPronum}
          title="교환할 상품 선택"
        />
      )}
    </div>
  );
}
