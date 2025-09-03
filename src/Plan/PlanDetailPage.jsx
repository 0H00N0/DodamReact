import React , {useEffect, useState} from 'react';
import {api} from "../utils/api";
import {useParams, useNavigate} from "react-router-dom";

export default function PlanDetailPage(){
    const {planCode} = useParams();
    const [plan, setPlan] = useState(null);
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/plans/${planCode}`);
        setPlan(data);
      } catch (e) {
        setErr("플랜 정보를 불러오지 못했습니다.");
      }
    })();
  }, [planCode]);

  if (err) return <div style={{padding:24, color:"crimson"}}>{err}</div>;
  if (!plan) return <div style={{padding:24}}>불러오는 중...</div>;

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>{plan.planName} ({plan.planCode})</h1>
      <ul>
        <li>활성: {plan.planActive ? "Y" : "N"}</li>
        <li>생성일: {plan.planCreate?.replace("T"," ").slice(0,19)}</li>
        <li>월 대여 상한: {plan.pbPriceCap?.toLocaleString?.() ?? plan.pbPriceCap} KRW</li>
        <li>혜택 설명: {plan.pbNote}</li>
      </ul>
      <div style={{ display:"flex", gap:8, marginTop:16 }}>
        <button onClick={() => navigate(-1)} style={{padding:"10px 14px", borderRadius:8, border:"1px solid #ddd", background:"#fff", cursor:"pointer"}}>
          돌아가기
        </button>
        <button onClick={() => navigate(`/checkout?code=${plan.planCode}`)}
          style={{padding:"10px 14px", borderRadius:8, border:"none", background:"#111827", color:"#fff", cursor:"pointer"}}>
          이 플랜으로 결제 진행
        </button>
      </div>
    </div>
  );
}