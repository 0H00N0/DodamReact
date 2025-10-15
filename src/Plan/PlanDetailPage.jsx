// src/pages/PlanDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./PlanDetailPage.css";
import { useScrollTop } from "./PlanScrollTop";

/* note 파서: 첫 줄은 설명, 불릿(-,*)은 포함 혜택 */
function splitBenefit(note) {
  if (!note) return { desc: "", items: [] };
  const normalized = note
    .replaceAll("\r\n", "\n")
    .replace(/•/g, "- ")
    .replace(/ - /g, "\n- ");
  const lines = normalized.split("\n").map((s) => s.trim()).filter(Boolean);
  const items = [], descParts = [];
  for (const line of lines) {
    if (/^(-|\*)\s+/.test(line)) items.push(line.replace(/^(-|\*)\s+/, ""));
    else descParts.push(line);
  }
  return { desc: descParts[0] || "", items };
}

export default function PlanDetailPage() {
  useScrollTop({ behavior: "auto" });
  const { planCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ PlanSelectPage에서 넘어온 모드/현재구독
  const mode = location?.state?.mode || "new";           // "change" | "new"
  const current = location?.state?.currentPlan || null;  // { pmId, ... }

  const [plan, setPlan] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [hasActiveSub, setHasActiveSub] = useState(false); // ✅ 활성 구독 여부 상태

  const nf = useMemo(() => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }), []);

  // ✅ 플랜 상세 불러오기
  useEffect(() => {
    let ignore = false;
    setLoading(true); setErr(""); setPlan(null); setSelectedMonths(null);
    (async () => {
      try {
        const { data } = await api.get(`/plans/${planCode}`);
        if (ignore) return;
        setPlan(data);
        const firstMonths =
          data?.planPrices?.[0]?.months ??
          data?.prices?.[0]?.months ??
          null;
        setSelectedMonths(firstMonths);
      } catch {
        if (!ignore) setErr("플랜 정보를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [planCode]);

  // ✅ 회원의 활성 구독 여부 확인 (페이지 진입 시 조회만)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/member/subscriptions/my");
        const active = Array.isArray(data)
          ? data.some((s) => s.pmStat === "ACTIVE" || s.status === "ACTIVE")
          : false;
        setHasActiveSub(active);
      } catch {
        setHasActiveSub(false);
      }
    })();
  }, []);

  // note → 설명/혜택
  const noteText = plan?.note || "";
  const { desc: parsedDesc, items: parsedItems } = useMemo(() => splitBenefit(noteText), [noteText]);

  const benefitItems = useMemo(() => {
    if (parsedItems.length > 0) return parsedItems;
    return Array.isArray(plan?.benefits) ? plan.benefits : [];
  }, [parsedItems, plan?.benefits]);

  const mergedBenefits = useMemo(() => {
    const seen = new Set(); const noteKey = (noteText || "").trim().toLowerCase();
    return benefitItems.filter((x) => {
      const k = (x || "").trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      if (noteKey && (k === noteKey || noteKey.startsWith(k) || k.startsWith(noteKey))) return false;
      seen.add(k); return true;
    });
  }, [benefitItems, noteText]);

  if (loading) {
    return (
      <div className="plan-detail-skeleton">
        <div className="sk-title" /><div className="sk-line" /><div className="sk-line" /><div className="sk-box" />
      </div>
    );
  }
  if (err) return <div className="error">{err}</div>;
  if (!plan) return <div className="error">플랜이 존재하지 않습니다.</div>;
  if (plan?.isActive === false) return <div className="error">현재 판매 중인 플랜이 아닙니다.</div>;

  // 가격/기간
  const prices = plan.planPrices || plan.prices || [];
  const selectedPrice = prices.find((p) => p.months === Number(selectedMonths));

  const monthlyPrice =
    selectedPrice && selectedPrice.months > 0
      ? Math.round((selectedPrice.amountInt ?? selectedPrice.amount) / selectedPrice.months)
      : null;

  const rentalCapText =
    plan.rentalPriceCapInt > 0
      ? `${nf.format(plan.rentalPriceCapInt)}원`
      : "제한 없음";

  // ✅ priceId 추출(있으면 전달)
  const pickPriceId = (months) => {
    const row = prices.find((p) => p.months === Number(months));
    return row?.ppriceId ?? row?.priceId ?? row?.id ?? null;
  };

  // ✅ 메인 버튼 동작 (결제 버튼 클릭 시)
  const handlePrimary = async () => {
    if (!selectedPrice) return;

    // ✅ 활성 구독이 있을 경우 안내 및 이동
    if (hasActiveSub && mode === "new") {
      alert("이미 활성화된 구독이 있습니다.\n구독 변경을 원하시면 구독 확인 페이지에서 변경해주세요.\n구독 확인 페이지로 이동합니다.");
      navigate("/member/membership");
      return;
    }

    if (mode === "change") {
      if (!current?.pmId) {
        alert("현재 구독 정보가 없습니다. 다시 시도해주세요.");
        navigate("/member/membership");
        return;
      }
      if (!window.confirm(
        `'${plan.displayName || plan.planName || plan.planCode}'을(를) ${selectedPrice.months}개월로 변경 예약하시겠어요?\n다음 결제일부터 적용됩니다.`
      )) return;

      try {
        await api.post("/subscriptions/change", {
          pmId: current.pmId,
          planCode: plan.planCode,
          months: Number(selectedPrice.months),
          priceId: pickPriceId(selectedPrice.months),
        });
        alert("변경이 예약되었습니다. 다음 결제일부터 적용됩니다.");
        navigate("/member/membership");
      } catch (e) {
        const msg =
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          "구독 변경 예약에 실패했습니다.";
        alert(msg);
      }
    } else {
      // 신규 결제 플로우
      navigate(`/plan/checkout?code=${plan.planCode}&months=${selectedPrice.months}`);
    }
  };

  const descToShow = parsedDesc?.trim() ? parsedDesc : (plan.note || "");

  return (
    <div className="plan-detail-container">
      {/* 상단 헤더 */}
      <div className="plan-detail-header">
        <button type="button" onClick={() => navigate(-1)} className="btn-ghost" aria-label="뒤로가기">← 뒤로</button>
        <h1 className="plan-detail-title">{plan.displayName}</h1>
        {plan.planCode && <span className="plan-badge" title={`코드: ${plan.planCode}`}>{plan.planCode}</span>}
      </div>

      {/* 변경 안내 배너 */}
      {mode === "change" && (
        <div className="plan-change-banner">
          현재 구독 변경 진행 중입니다. 선택하신 기간·가격은 <b>다음 결제일부터</b> 적용됩니다.
        </div>
      )}

      {/* 핵심 정보 카드 */}
      <div className="plan-summary-card">
        <ul className="plan-kv">
          <li><span className="kv-key">월 대여 상한</span><span className="kv-val">{rentalCapText}</span></li>
          <li>
            <span className="kv-key">혜택 설명</span>
            <span className="kv-val">
              {descToShow
                ? descToShow.split("\n").map((line, i, arr) => (
                    <span key={i}>{line}{i !== arr.length - 1 && <br />}</span>
                  ))
                : "—"}
            </span>
          </li>
        </ul>

        {mergedBenefits.length > 0 && (
          <div className="benefit-box">
            <div className="benefit-title">포함 혜택</div>
            <ul className="benefit-list">
              {mergedBenefits.map((b, idx) => (
                <li key={idx} className="benefit-item"><span className="benefit-dot" aria-hidden />{b}</li>
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
                {pp.months}개월 — {nf.format(pp.amountInt ?? pp.amount)}원
                {pp.discountRate > 0 ? ` (약 ${pp.discountRate}%↓)` : ""}
              </option>
            ))}
          </select>

          {selectedPrice && (
            <div className="price-pill">
              <div className="pill-top">총액 {nf.format(selectedPrice.amountInt ?? selectedPrice.amount)}원</div>
              <div className="pill-bottom">
                월 환산 {nf.format(monthlyPrice)}원
                {selectedPrice.discountRate > 0 && (
                  <span className="discount-badge">-{selectedPrice.discountRate}%</span>
                )}
              </div>
            </div>
          )}
        </div>
        {!prices.length && <p className="help-text">현재 선택 가능한 기간/가격이 없습니다.</p>}
      </div>

      {/* 액션 바 */}
      <div className="action-bar">
        <div className="action-inner">
          <button onClick={() => navigate(-1)} className="btn-secondary">돌아가기</button>
          <button
            onClick={handlePrimary}
            className="btn-primary"
            disabled={!selectedPrice}
            aria-disabled={!selectedPrice}
          >
            {mode === "change"
              ? (selectedPrice ? `${selectedPrice.months}개월 변경 예약` : "변경 예약")
              : (selectedPrice ? `${selectedPrice.months}개월 결제 진행` : "결제 불가")}
          </button>
        </div>
      </div>

      <div className="fine-print">
        {mode === "change"
          ? <>변경 예약은 <b>다음 결제일</b>에 새 플랜으로 갱신됩니다.</>
          : <>결제는 포트원(토스페이먼츠) 테스트 환경으로 진행됩니다. 결제 완료 후 플랜 혜택이 즉시 적용됩니다.</>}
      </div>
    </div>
  );
}
