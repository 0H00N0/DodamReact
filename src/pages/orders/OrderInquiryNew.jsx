import React, { useEffect, useMemo, useState } from "react";
import { fetchMyRents } from "../../Product/api/rentApi";
import { createProductInquiry } from "../../Product/api/inquiryApi";
import { useLocation } from "react-router-dom";

export default function OrderInquiryNew() {
  const [rows, setRows] = useState([]);
  const [sel, setSel] = useState(null); // {renNum, pronum, proname}
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchMyRents();
        const normalized = (Array.isArray(list) ? list : []).map(r => ({
          ...r,
          renNum: r.renNum ?? r.rentNum,
        }));
        setRows(normalized);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // OrderHistory에서 넘어온 state
  useEffect(() => {
    const s = location?.state;
    if (s?.renNum && s?.pronum) {
      setSel({ renNum: s.renNum, pronum: s.pronum, proname: "" });
    }
  }, [location?.state]);

  const delivered = useMemo(
    () => (rows || []).filter(r => r.status === "DELIVERED"),
    [rows]
  );

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!sel) return setMsg("상품을 선택해 주세요.");
    if (!title.trim() || !content.trim()) return setMsg("제목/내용을 작성해 주세요.");

    try {
      await createProductInquiry({
        pronum: sel.pronum,
        renNum: sel.renNum,
        title: title.trim(),
        content: content.trim(),
      });
      setMsg("문의가 등록되었습니다.");
      setTitle(""); setContent(""); setSel(null);
    } catch (err) {
      const m = err?.response?.data?.message || "등록에 실패했습니다.";
      setMsg(m);
    }
  };

  if (loading) return <div className="member-page"><div className="m-card">불러오는 중...</div></div>;

  return (
    <div className="member-page">
      <div className="m-card wide" style={{maxWidth:900, width:"100%"}}>
        <h2 className="m-title">주문상품 문의하기</h2>
        <p className="m-muted" style={{marginTop:8}}>배송완료된 주문만 선택할 수 있습니다.</p>

        {/* 상품 선택 목록 */}
        <div style={{display:"grid", gap:12, margin:"16px 0"}}>
          {delivered.length === 0 && <div className="m-muted">배송완료된 주문이 없습니다.</div>}
          {delivered.map(r => (
            <label key={r.renNum} className="m-card" style={{margin:0, padding:12}}>
              <div style={{display:"flex", alignItems:"center", gap:12}}>
                <input
                  type="radio"
                  name="sel"
                  checked={sel?.renNum === r.renNum && sel?.pronum === r.pronum}
                  onChange={() => setSel({ renNum: r.renNum, pronum: r.pronum, proname: r.productName })}
                />
                <div>
                  <div style={{fontWeight:700}}>{r.productName}</div>
                  <div className="m-muted" style={{fontSize:12}}>주문번호: {r.renNum}</div>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* 문의 폼 */}
        <form onSubmit={submit} className="m-form">
          <input
            className="m-input"
            value={title} onChange={e=>setTitle(e.target.value)}
            placeholder="제목"
          />
          <textarea
            className="m-textarea"
            value={content} onChange={e=>setContent(e.target.value)}
            placeholder="문의 내용을 입력하세요"
            rows={7}
          />
          <div className="m-actions" style={{justifyContent:'flex-end'}}>
            <button type="submit" className="m-btn">등록</button>
          </div>
          {!!msg && (
            <div className={msg.includes("등록되었습니다") ? "m-muted" : "m-error"}>
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
