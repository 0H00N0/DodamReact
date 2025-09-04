// src/pages/PlanDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import "./PlanDetailPage.css";

export default function PlanDetailPage() {
  const { planCode } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 숫자 통화 포맷터 (KRW, 천단위 콤마)
  const nf = useMemo(
    () =>
      new Intl.NumberFormat("ko-KR", {
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setErr("");
    setPlan(null);
    setSelectedMonths(null);

    (async () => {
      try {
        const { data } = await api.get(`/plans/${planCode}`);
        if (ignore) return;

        // 기대 응답 예시:
        // {
        //   planCode: "BASIC",
        //   displayName: "베이직",
        //   note: "월 최대 2개 대여, 파손보장 기본",
        //   rentalPriceCapInt: 100000,  // 0이면 제한 없음
        //   isActive: true,
        //   planPrices: [
        //     { months: 1, amountInt: 19000, discountRate: 0 },
        //     { months: 3, amountInt: 54000, discountRate: 5 },  // 총액 기준
        //     { months: 12, amountInt: 199000, discountRate: 13 }
        //   ],
        //   benefits: [ "동시 대여 1개", "무료 왕복 배송 1회/월", "파손 보장 기본" ]
        // }

        setPlan(data);
        // 기본 선택: 첫 번째 가격 옵션
        const firstMonths = data?.planPrices?.[0]?.months ?? null;
        setSelectedMonths(firstMonths);
      } catch (e) {
        if (!ignore) setErr("플랜 정보를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [planCode]);

  if (loading) {
    return (
      <div className="plan-detail-skeleton">
        <div className="sk-title" />
        <div className="sk-line" />
        <div className="sk-line" />
        <div className="sk-box" />
      </div>
    );
  }

  if (err) return <div className="error">{err}</div>;
  if (!plan) return <div className="error">플랜이 존재하지 않습니다.</div>;
  if (plan?.isActive === false)
    return <div className="error">현재 판매 중인 플랜이 아닙니다.</div>;

  const prices = plan.planPrices || [];
  const selectedPrice = prices.find((p) => p.months === Number(selectedMonths));

  const monthlyPrice =
    selectedPrice && selectedPrice.months > 0
      ? Math.round(selectedPrice.amountInt / selectedPrice.months)
      : null;

  const rentalCapText =
    plan.rentalPriceCapInt > 0
      ? `${nf.format(plan.rentalPriceCapInt)}원`
      : "제한 없음";

  const handleCheckout = () => {
    if (!selectedPrice) return;
    navigate(`/checkout?code=${plan.planCode}&months=${selectedPrice.months}`);
  };

  return (
    <div className="plan-detail-container">
      {/* 상단 헤더 */}
      <div className="plan-detail-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-ghost"
          aria-label="뒤로가기"
        >
          ← 뒤로
        </button>
        <h1 className="plan-detail-title">{plan.displayName}</h1>
        {plan.planCode && (
          <span className="plan-badge" title={`코드: ${plan.planCode}`}>
            {plan.planCode}
          </span>
        )}
      </div>

      {/* 핵심 정보 카드 */}
      <div className="plan-summary-card">
        <ul className="plan-kv">
          <li>
            <span className="kv-key">월 대여 상한</span>
            <span className="kv-val">{rentalCapText}</span>
          </li>
          <li>
            <span className="kv-key">혜택 설명</span>
            <span className="kv-val">{plan.note || "—"}</span>
          </li>
        </ul>

        {/* 추가 혜택 리스트(있을 때만 표기) */}
        {Array.isArray(plan.benefits) && plan.benefits.length > 0 && (
          <div className="benefit-box">
            <div className="benefit-title">포함 혜택</div>
            <ul className="benefit-list">
              {plan.benefits.map((b, idx) => (
                <li key={idx} className="benefit-item">
                  <span className="benefit-dot" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 가격/기간 선택 */}
      <div className="plan-price-selector">
        <label htmlFor="monthsSelect">구독 기간</label>
        <div className="select-row">
          <select
            id="monthsSelect"
            value={selectedMonths ?? ""}
            onChange={(e) => setSelectedMonths(Number(e.target.value))}
            disabled={!prices.length}
          >
            {prices.map((pp) => (
              <option key={pp.months} value={pp.months}>
                {pp.months}개월 — {nf.format(pp.amountInt)}원
                {pp.discountRate > 0 ? ` (약 ${pp.discountRate}%↓)` : ""}
              </option>
            ))}
          </select>

          {selectedPrice && (
            <div className="price-pill">
              <div className="pill-top">
                총액 {nf.format(selectedPrice.amountInt)}원
              </div>
              <div className="pill-bottom">
                월 환산 {nf.format(monthlyPrice)}원
                {selectedPrice.discountRate > 0 && (
                  <span className="discount-badge">
                    -{selectedPrice.discountRate}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {!prices.length && (
          <p className="help-text">현재 선택 가능한 기간/가격이 없습니다.</p>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="button-group">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          돌아가기
        </button>
        <button
          onClick={handleCheckout}
          className="btn-primary"
          disabled={!selectedPrice}
          aria-disabled={!selectedPrice}
        >
          {selectedPrice ? `${selectedPrice.months}개월 결제 진행` : "결제 불가"}
        </button>
      </div>

      {/* 하단 안내(선택) */}
      <div className="fine-print">
        결제는 포트원(토스페이먼츠) 테스트 환경으로 진행됩니다. 결제 완료 후
        플랜 혜택이 즉시 적용됩니다.
      </div>
    </div>
  );
}
