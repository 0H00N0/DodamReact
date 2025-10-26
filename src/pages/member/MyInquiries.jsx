import React, { useEffect, useState } from "react";
import { fetchMyProductInquiries } from "../../Product/api/inquiryApi";

import "./MemberTheme.css";

export default function MyInquiries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 안전한 날짜 포맷터 (초 숨기고 분까지 표기)
  const fmtDateMinute = (raw) => {
    if (!raw) return "";
    // 공백 구분으로 오는 경우 대비해 'T' 치환
    const s = (typeof raw === "string" && !raw.includes("T")) ? raw.replace(" ", "T") : raw;
    const d = new Date(s);
    if (isNaN(d)) return ""; // 파싱 실패 시 빈 문자열
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // 24시간제로 원하면 false
    }).format(d);
  };

  useEffect(() => {
    (async () => {
      try { setRows(await fetchMyProductInquiries()); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div style={{padding:24}}>불러오는 중...</div>;

  return (
    <div className="member-page">
      <div className="m-card">
    <div style={{padding:24, maxWidth:900, margin:"0 auto"}}>
      <h2>나의 주문상품 문의</h2>
      <div style={{marginTop:12, display:"grid", gap:12}}>
        {rows.length === 0 && <div>작성한 문의가 없습니다.</div>}
        {rows.map(v => (
          <div key={v.id} style={{border:"1px solid #eee", borderRadius:8, padding:12}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div style={{fontWeight:700}}>{v.title}</div>
              {/* ✅ 여기만 변경 */}
              <div style={{fontSize:12, color:"#888"}}>{fmtDateMinute(v.createdAt)}</div>
            </div>
            <div style={{marginTop:4, fontSize:14, color:"#555"}}>상품: {v.productName} (#{v.pronum})</div>
            {v.renNum && <div style={{fontSize:12, color:"#777"}}>주문번호: {v.renNum}</div>}
            <div style={{marginTop:8, whiteSpace:"pre-wrap"}}>{v.content}</div>
            <div style={{marginTop:12, padding:10, background:"#fafafa", borderRadius:6}}>
              <b>상태:</b> {v.status}
              {v.answerContent && (
                <div style={{marginTop:8}}>
                  <div style={{fontWeight:600}}>답변</div>
                  <div style={{whiteSpace:"pre-wrap"}}>{v.answerContent}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
      </div>
    </div>
  );
}
