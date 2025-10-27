import React, { useEffect, useState } from "react";
import { fetchMyRents, cancelRent, exchangeRent, returnRent } from "../../Product/api/rentApi";
import { shipStatusLabel } from "../../utils/shipStatusLabel";
import ProductPickerModal from "../ProductPickerModal";
import { useNavigate } from "react-router-dom";

export default function OrderHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  // { renNum, type:'EXCHANGE', newPronum:'', reason:'', origPronum }
  const [modal, setModal] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();

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

  // status: 'SHIPPING' | 'DELIVERED'
  const canCancel = (r) => r.status === 'SHIPPING';
  const canExchange = (r) => r.status === 'SHIPPING';
  const canReturn = (r) => r.status === 'DELIVERED';

  const onCancel = async (r) => {
    if (!window.confirm("이 주문을 취소할까요?")) return;
    try { await cancelRent(r.rentNum); alert("취소되었습니다."); reload(); }
    catch (e) { alert(e?.response?.data?.message || e?.message || "취소 중 오류"); }
  };

  const onExchange = (r) =>
    setModal({ renNum: r.rentNum, type:'EXCHANGE', newPronum:'', reason:'', origPronum: r.pronum });

  const onReturn = async (r) => {
    const reason = window.prompt("반품 사유를 입력하세요(선택)");
    try { await returnRent(r.rentNum, reason || ""); alert("반품이 접수되었습니다."); reload(); }
    catch (e) { alert(e?.response?.data?.message || e?.message || "반품 요청 중 오류"); }
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

  if (loading) return <div className="member-page"><div className="m-card">불러오는 중...</div></div>;
  if (err) return <div className="member-page"><div className="m-card m-error">{err}</div></div>;

  return (
    <div className="member-page">
      <div className="m-card wide">
        <h2 className="m-title">주문 내역</h2>

        <div style={{overflowX:"auto"}}>
          <table className="m-table">
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
                  <td>{r.rentNum ?? "-"}</td>
                  <td>{r.productName}</td>
                  <td>{shipStatusLabel(r.status)}</td>
                  <td>{r.rentDate ? String(r.rentDate).replace("T"," ").slice(0,19) : "-"}</td>
                  <td>
                    <div className="m-actions">
                      {canCancel(r)   && <button className="m-btn ghost" onClick={() => onCancel(r)}>취소</button>}
                      {canExchange(r) && <button className="m-btn" onClick={() => onExchange(r)}>교환</button>}
                      {canReturn(r)   && <button className="m-btn ghost" onClick={() => onReturn(r)}>반품</button>}
                      {canReturn(r)   && (
                        <button
                          className="m-btn"
                          onClick={() => navigate('/orders/inquiry', { state: { renNum: r.rentNum, pronum: r.pronum } })}
                        >
                          문의하기
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 교환 모달 */}
      {modal && modal.type === 'EXCHANGE' && (
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
                    onChange={e => setModal({ ...modal, newPronum: e.target.value })}
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
                  onChange={e => setModal({ ...modal, reason: e.target.value })}
                  placeholder="교환 사유를 입력하세요"
                />
              </div>

              <div className="m-actions" style={{justifyContent:'flex-end'}}>
                <button className="m-btn ghost" onClick={() => setModal(null)}>닫기</button>
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
