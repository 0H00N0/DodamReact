// src/pages/PlanDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import "./PlanDetailPage.css";
import { useScrollTop } from "./PlanScrollTop";

/**
 * note 문자열 파싱
 * - 첫 줄(불릿이 아닌 줄)은 '혜택 설명(desc)'로
 * - '-' 또는 '*' 로 시작하는 줄만 '포함 혜택(items)'로
 */
function splitBenefit(note) {
  if (!note) return { desc: "", items: [] };

  const normalized = note
    .replaceAll("\r\n", "\n")
    .replace(/•/g, "- ")      // '•'도 불릿 처리
    .replace(/ - /g, "\n- "); // "문장 - 문장" 패턴을 줄바꿈 불릿으로

  const lines = normalized
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const items = [];
  const descParts = [];
  for (const line of lines) {
    if (/^(-|\*)\s+/.test(line)) {
      // 불릿 줄 → 포함 혜택 항목
      items.push(line.replace(/^(-|\*)\s+/, ""));
    } else {
      // 불릿이 아닌 줄 → 설명 후보
      descParts.push(line);
    }
  }

  return {
    desc: descParts.length > 0 ? descParts[0] : "", // 설명은 첫 줄만 사용
    items,
  };
}

export default function PlanDetailPage() {
  useScrollTop({ behavior: "auto" }); // ✅ 페이지 진입 시 맨 위로
  const { planCode } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 숫자 포맷터
  const nf = useMemo(
    () =>
      new Intl.NumberFormat("ko-KR", {
        maximumFractionDigits: 0,
      }),
    []
  );

  // 데이터 로딩
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
        setPlan(data);
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

  // ===================== 핵심 변경 영역 (항상 훅 먼저 호출) =====================
  const noteText = plan?.note || "";

  // note 파싱
  const { desc: parsedDesc, items: parsedItems } = useMemo(
    () => splitBenefit(noteText),
    [noteText]
  );

  // ✅ 변경 1) parsedItems가 하나라도 있으면 그것만 사용, 없으면 서버 benefits 사용
  const benefitItems = useMemo(() => {
    if (parsedItems.length > 0) return parsedItems;
    return Array.isArray(plan?.benefits) ? plan.benefits : [];
  }, [parsedItems, plan?.benefits]);

  // ✅ 변경 2) (안전망) note 전체 문장과 동일/유사한 항목은 제외 + 중복 제거
  const mergedBenefits = useMemo(() => {
    const seen = new Set();
    const noteKey = (noteText || "").trim().toLowerCase();

    return benefitItems.filter((x) => {
      const k = (x || "").trim().toLowerCase();
      if (!k) return false;
      if (seen.has(k)) return false;
      // note 전체 문장이 benefit 항목으로 넘어오는 케이스 배제
      if (noteKey && (k === noteKey || noteKey.startsWith(k) || k.startsWith(noteKey))) {
        return false;
      }
      seen.add(k);
      return true;
    });
  }, [benefitItems, noteText]);
  // ===================== /핵심 변경 영역 =====================

  // 조건부 리턴 (훅 아래)
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

  // 파생 값들
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
    navigate(`/plan/checkout?code=${plan.planCode}&months=${selectedPrice.months}`);
  };

  const descToShow = parsedDesc?.trim() ? parsedDesc : (plan.note || "");

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
            <span className="kv-val">
              {descToShow
                ? descToShow.split("\n").map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i !== arr.length - 1 && <br />}
                    </span>
                  ))
                : "—"}
            </span>
          </li>
        </ul>

        {/* 포함 혜택 */}
        {mergedBenefits.length > 0 && (
          <div className="benefit-box">
            <div className="benefit-title">포함 혜택</div>
            <ul className="benefit-list">
              {mergedBenefits.map((b, idx) => (
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

      {/* 액션 바 */}
<div className="action-bar">
  <div className="action-inner">
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
</div>
      {/* 안내 */}
      <div className="fine-print">
        결제는 포트원(토스페이먼츠) 테스트 환경으로 진행됩니다. 결제 완료 후
        플랜 혜택이 즉시 적용됩니다.
      </div>
    </div>
  );
}
