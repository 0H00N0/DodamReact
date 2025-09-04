// src/pages/PlanDetailPage.jsx
import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import "./PlanDetailPage.css";

export default function PlanDetailPage() {
  const { planCode } = useParams();
  const [plan, setPlan] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
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

  if (err) return <div className="error">{err}</div>;
  if (!plan) return <div className="loading">불러오는 중...</div>;

  const handleCheckout = () => {
    navigate(`/checkout?code=${plan.planCode}&months=${selectedMonths}`);
  };

  return (
    <div className="plan-detail-container">
      <h1 className="plan-detail-title">{plan.displayName}</h1>
      <ul className="plan-detail-info">
        <li>
          월 대여 상한:{" "}
          {plan.rentalPriceCapInt > 0
            ? `${plan.rentalPriceCapInt.toLocaleString()}원`
            : "제한 없음"}
        </li>
        <li>혜택 설명: {plan.note}</li>
      </ul>

      <div className="plan-price-selector">
        <label>구독 기간 선택:</label>
        <select
          value={selectedMonths}
          onChange={(e) => setSelectedMonths(Number(e.target.value))}
        >
          {plan.planPrices?.map((pp) => (
            <option key={pp.months} value={pp.months}>
              {pp.months}개월 — {pp.amountInt.toLocaleString()}원
            </option>
          ))}
        </select>
      </div>

      <div className="button-group">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          돌아가기
        </button>
        <button onClick={handleCheckout} className="btn-primary">
          {selectedMonths}개월 결제 진행
        </button>
      </div>
    </div>
  );
}
