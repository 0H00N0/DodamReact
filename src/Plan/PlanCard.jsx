import React from "react";

export default function PlanCard({plan, onSelect}) {
    return(
        <div style={{border:"1px solid #e5e7eb", borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:8}}>
            <h3 style={{margin:0}}>{plan.planName} ({plan.planCode})</h3>
            <div style={{fontSize:13, opacity:.8}}>{plan.pbNote}</div>
            <div style={{fontWeight:600, fontSize:18}}>
                월 대여 상한: {plan.pbPriceCap?.toLocaleString?.() ?? plan.pbPriceCap} KRW
            </div>
            <button onClick={() => onSelect(plan)}
                style={{marginTop:8, padding:"10px 14px", borderRadius:8, border:"none", background:"#111827", color:"#fff", cursor:"pointer"}}>
                플랜 혜택 보기
            </button>
        </div>
    );
}