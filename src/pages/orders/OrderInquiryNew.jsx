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
        // ✅ 필드명 불일치(rentNum vs renNum) 보정
        const normalized = (Array.isArray(list) ? list : []).map(r => ({
          ...r,
          renNum: r.renNum ?? r.rentNum,  // 통일: 화면은 renNum로 사용
        }));
        setRows(normalized);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ OrderHistory에서 넘어온 state(renNum, pronum)로 초기 선택값 세팅
  useEffect(() => {
    const s = location?.state;
    if (!s?.renNum || !s?.pronum) return;

    // proname은 목록 로딩 전이므로 우선 빈값, 목록 로딩 후 라벨에서 노출됨
    setSel({ renNum: s.renNum, pronum: s.pronum, proname: "" });
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

  if (loading) return <div style={{padding:24}}>불러오는 중...</div>;

  return (
    <div style={{padding:24, maxWidth:900, margin:"0 auto"}}>
      <h2>주문상품 문의하기</h2>
      <p style={{marginTop:8, color:"#666"}}>배송완료된 주문만 선택할 수 있습니다.</p>

      {/* 상품 선택 목록 */}
      <div style={{display:"grid", gap:12, margin:"16px 0"}}>
        {delivered.length === 0 && <div>배송완료된 주문이 없습니다.</div>}
        {delivered.map(r => (
          <label key={r.renNum} style={{border:"1px solid #ddd", borderRadius:8, padding:12, display:"flex", alignItems:"center", gap:12}}>
            <input
              type="radio"
              name="sel"
              checked={sel?.renNum === r.renNum && sel?.pronum === r.pronum}
              onChange={() => setSel({ renNum: r.renNum, pronum: r.pronum, proname: r.productName })}
            />
            <div>
              <div style={{fontWeight:600}}>{r.productName}</div>
              <div style={{fontSize:12, color:"#777"}}>주문번호: {r.renNum}</div>
            </div>
          </label>
        ))}
      </div>

      {/* 문의 폼 */}
      <form onSubmit={submit} style={{display:"grid", gap:8}}>
        <input
          value={title} onChange={e=>setTitle(e.target.value)}
          placeholder="제목" style={{padding:12, border:"1px solid #ccc", borderRadius:6}}
        />
        <textarea
          value={content} onChange={e=>setContent(e.target.value)}
          placeholder="문의 내용을 입력하세요"
          rows={7} style={{padding:12, border:"1px solid #ccc", borderRadius:6}}
        />
        <button type="submit" style={{padding:"10px 14px", border:"none", borderRadius:6, background:"#222", color:"#fff"}}>
          등록
        </button>
        {!!msg && <div style={{color: msg.includes("등록되었습니다") ? "#2e7d32" : "#d32f2f"}}>{msg}</div>}
      </form>
    </div>
  );
}
