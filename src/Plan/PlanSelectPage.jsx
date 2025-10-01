// src/pages/PlanSelectPage.jsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import PlanCard from "./PlanCard";
import { useNavigate } from "react-router-dom";
import "./PlanSelectPage.css";
import { useScrollTop } from "./PlanScrollTop";

const NORMAL_ORDER  = ["BASIC", "STANDARD", "PREMIUM"];
const PREMIUM_ORDER = ["FAMILY", "VIP"];
const up = (s) => (s ?? "").toString().trim().toUpperCase();

export default function PlanSelectPage() {
  useScrollTop({ behavior: "auto" }); // ✅ 페이지 진입 시 맨 위로
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/plans");
        const list = Array.isArray(data) ? data : [];
        //첫 글자가 대문자일 수도 있으니 카멜로 정규화
        const toCamel1 = (obj) => {
          const out = {};
          Object.entries(obj  || {}).forEach(([k, v]) => {
            const ck = k ? k.charAt(0).toLowerCase() + k.slice(1) : k;
            out[ck] = v;
          });
          return out;
        };
        setPlans(list.map(toCamel1));
      } catch {
        setErr("플랜 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  // 디버깅용 (개발 중에만)
useEffect(() => {
  if (!loading && !err) {
    const codes = plans.map(p => p.planCode);
    console.debug("[plans] codes:", codes);
  }
}, [plans, loading, err]);

  const handleSelect = (plan) => {
    if(!plan?.planCode) return; //planCode가 없을때 방어로직
    navigate(`/plans/${encodeURIComponent(plan.planCode)}`);
  }

  if (loading) return <div className="loading">불러오는 중 입니다…</div>;
  if (err) return <div className="error">{err}</div>;

  const normalPlans = plans
    .filter((p) => NORMAL_ORDER.includes(up(p.planCode)))
    .sort((a, b) => NORMAL_ORDER.indexOf(up(a.planCode)) - NORMAL_ORDER.indexOf(up(b.planCode)));

  const premiumPlans = plans
    .filter((p) => PREMIUM_ORDER.includes(up(p.planCode)))
    .sort((a, b) => PREMIUM_ORDER.indexOf(up(a.planCode)) - PREMIUM_ORDER.indexOf(up(b.planCode)));

  return (
    <div className="plan-select">
      <section className="intro">
        <h1 className="intro-title">도담 플랜</h1>
        <p className="intro-sub">
          우리 아이 나이에 맞춰 <strong>부담 없이</strong> 즐기는 장난감 구독.
          <br className="br-md" />
          <span className="intro-highlight">언제든 변경·해지 가능</span>하며, 첫 달부터 혜택을 누려보세요!
          <br />
          <span className="intro-highlight">3,6,12개월 결제시 추가 할인까지!</span>
        </p>
      </section>

      <section>
        <h2 className="section-title">일반 플랜</h2>
        <div className="plan-grid grid-3">
          {normalPlans.map((p) => (
            <PlanCard key={p.planId ?? p.planCode} plan={p} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">프리미엄 플랜</h2>
        <div className="plan-grid grid-2">
          {premiumPlans.map((p) => (
            <PlanCard key={p.planId ?? p.planCode} plan={p} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      <section className="reassure">
        <ul>
          <li>✅ 0~12세 연령대 맞춤 큐레이션</li>
          <li>✅ 세척·살균 완료 후 안전 배송</li>
          <li>✅ 분실/파손 걱정 최소화 가이드 제공</li>
          <li>✅ 구독 중 언제든 플랜 변경 가능</li>
        </ul>
      </section>
    </div>
  );
}
