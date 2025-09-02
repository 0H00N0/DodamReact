import React, { useState, useEffect } from "react";
import {api} from "../utils/api";
import PlanCard from "./PlanCard";
import {useNavigate} from "react-router-dom";

export default function PlanSelectPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        (async () =>{
            try {
                const {data} = await api.get("/plans");
                setPlans(data);
            }catch(e){
                setErr("플랜 목록을 불러오지 못했습니다.");
            } finally{
                setLoading(false);
            }
        })();
    }, []);

    //플랜 선택시 상세페이지로 이동
    const handleSelect = (plan) => navigate(`/plans/${plan.planCode}`);
    
    if(loading) return <div style={{padding:24}}>불러오는 중 입니다...</div>;
    if(err) return <div style={{padding:24, color:"crimson"}}>{err}</div>;

    return(
        <div style={{ maxWidth: 1040, margin: "40px auto", padding: 16 }}>
            <h1>구독 플랜 선택</h1>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16}}>
                {plans.map((p) => <PlanCard key={p.planId} plan={p} onSelect={handleSelect} />)}
            </div>
        </div>
    );
}