// src/components/PlanCard.jsx
import React from "react";
import "./PlanCard.css";

const badgeLabel = (code) => {
  const c = (code || "").toUpperCase();
  if (c === "BASIC") return "입문 추천";
  if (c === "STANDARD") return "가성비";
  if (c === "PREMIUM") return "인기";
  if (c === "FAMILY") return "패밀리 베스트";
  if (c === "VIP") return "VIP 특가";
  return null;
};

export default function PlanCard({ plan, onSelect }) {
  const label = badgeLabel(plan.planCode);

  return (
    <article className="plan-card" aria-label={`${plan.displayName} 플랜`}>
      {label && <span className={`plan-badge ${plan.planCode.toLowerCase()}`}>{label}</span>}

      <h3 className="plan-title">{plan.displayName}</h3>
      {plan.note && <p className="plan-note">{plan.note}</p>}

      <ul className="plan-meta">
        <li>
          <span className="plan-meta-key">월 대여 상한</span>
          <span className="plan-meta-val">
            {plan.rentalPriceCapInt > 0 ? `${plan.rentalPriceCapInt.toLocaleString()}원` : "제한 없음"}
          </span>
        </li>
        <li>
          <span className="plan-meta-key">월 구독료</span>
          <span className="plan-meta-val strong">{plan.priceInt.toLocaleString()}원</span>
        </li>
      </ul>

      <button
        onClick={() => onSelect(plan)}
        className="plan-btn"
        aria-label={`${plan.displayName} 혜택 보기`}
      >
        플랜 혜택 보기
      </button>
    </article>
  );
}
