// src/pages/PlanDetailPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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

  // ✅ 활성 구독 여부 & 요약
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [activeSummary, setActiveSummary] = useState(null);

  // ✅ "이미 구독중" 모달
  const [alreadyOpen, setAlreadyOpen] = useState(false);
  const openAlready = () => setAlreadyOpen(true);
  const closeAlready = () => setAlreadyOpen(false);

  // ✅ 공통 모달 (변경 예약 confirm/완료/오류)
  const [modal, setModal] = useState({
    open: false,
    tone: "info", // "info" | "confirm" | "success" | "error"
    title: "",
    description: "",
    primaryLabel: "확인",
    secondaryLabel: null,
    onConfirm: null,
    onCancel: null,
    onAfterClose: null, // (성공 후 이동 등에 사용)
  });
  const openModal = useCallback((cfg) => setModal((m) => ({ ...m, ...cfg, open: true })), []);
  const closeModal = useCallback(() => {
    setModal((m) => {
      m.onAfterClose?.();
      return { ...m, open: false, onConfirm: null, onCancel: null, onAfterClose: null };
    });
  }, []);

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
        const list = Array.isArray(data) ? data : [];
        const activeItem = list.find((s) => s.pmStat === "ACTIVE" || s.status === "ACTIVE");
        setHasActiveSub(Boolean(activeItem));

        if (activeItem) {
          setActiveSummary({
            planName: activeItem.planName || activeItem.plan?.planName || activeItem.pmPlanName || null,
            planCode: activeItem.planCode || activeItem.plan?.planCode || null,
            months: activeItem.months || activeItem.pmCycle || activeItem.terms?.ptermMonth || null,
            nextBillingAt: activeItem.nextBillingAt || activeItem.nextBillAt || activeItem.pmNextBillAt || activeItem.nextBillingDate || null,
            endAt: activeItem.currentEndAt || activeItem.pmEndAt || activeItem.endAt || null,
          });
        } else {
          setActiveSummary(null);
        }
      } catch {
        setHasActiveSub(false);
        setActiveSummary(null);
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

    // ✅ 활성 구독이 있을 경우: alert → 모달
    if (hasActiveSub && mode === "new") {
      openAlready();
      return;
    }

    if (mode === "change") {
      // ❌ 현재 구독 정보 없음 → info 모달 후 이동
      if (!current?.pmId) {
        openModal({
          tone: "info",
          title: "현재 구독 정보를 찾을 수 없어요",
          description: "다시 시도해주세요. 구독 확인 페이지로 이동합니다.",
          primaryLabel: "확인",
          onConfirm: () => {},
          onAfterClose: () => navigate("/member/membership"),
        });
        return;
      }

      // ✅ 변경 예약 확인 모달
      openModal({
        tone: "confirm",
        title: "이 플랜으로 변경 예약하시겠어요?",
        description: `'${plan.displayName || plan.planName || plan.planCode}'을(를) ${selectedPrice.months}개월로 변경 예약합니다. 다음 결제일부터 적용됩니다.`,
        primaryLabel: "변경 예약",
        secondaryLabel: "취소",
        onConfirm: async () => {
          try {
            await api.post("/subscriptions/change", {
              pmId: current.pmId,
              planCode: plan.planCode,
              months: Number(selectedPrice.months),
              priceId: pickPriceId(selectedPrice.months),
            });
            // ✅ 성공 모달
            openModal({
              tone: "success",
              title: "변경 예약 완료",
              description: "선택하신 플랜이 다음 결제일부터 적용됩니다.",
              primaryLabel: "확인",
              onConfirm: () => {},
              onAfterClose: () => navigate("/member/membership"),
            });
          } catch (e) {
            const msg =
              e?.response?.data?.error ||
              e?.response?.data?.message ||
              "구독 변경 예약에 실패했습니다.";
            // ❌ 오류 모달
            openModal({
              tone: "error",
              title: "변경 예약 실패",
              description: msg,
              primaryLabel: "확인",
              onConfirm: () => {},
            });
          }
        },
        onCancel: () => {},
      });
    } else {
      // 신규 결제 플로우
      navigate(`/plan/checkout/${encodeURIComponent(plan.planCode)}/${selectedPrice.months}`);
    }
  };

  const descToShow = (parsedDesc?.trim() ? parsedDesc : (plan.note || ""));

  // === 모달(오버레이) 스타일 (Checkout과 톤 맞춤) ===
  const theme = {
    panel: "#FFFFFF",
    panelAlt: "#FFF4F8",
    border: "#FFE3EE",
    borderStrong: "#FFD1E5",
    text: "#6F5663",
    textSub: "#9A8190",
    accent: "#FFC8DB",
    accentDeep: "#FFB3D0",
    accentSoft: "#FFF6FA",
    shadow: "0 10px 24px rgba(255, 175, 205, 0.15)",
    radius: 18,
  };
  const styles = {
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "grid", placeItems: "center", zIndex: 9999,
    },
    overlayCard: {
      width: "min(92vw, 520px)", background: theme.panel, borderRadius: theme.radius,
      border: `1px solid ${theme.borderStrong}`, boxShadow: theme.shadow, padding: 20,
    },
    overlayTitle: { fontSize: 18, fontWeight: 900, color: theme.text, margin: 0 },
    overlaySub: { marginTop: 6, fontSize: 13, color: theme.textSub },
    infoBox: { marginTop: 12, background: theme.accentSoft, border: `1px solid ${theme.borderStrong}`, borderRadius: 14, padding: 12 },
    row: { marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13, color: theme.textSub },
    badge: { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: theme.panelAlt, border: `1px solid ${theme.borderStrong}`, fontSize: 12, fontWeight: 800, color: theme.text },
    actions: { marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    btn: {
      padding: "14px 16px", borderRadius: 999, border: `1px solid ${theme.borderStrong}`,
      background: "#fff", color: theme.text, fontWeight: 800, letterSpacing: 0.2, fontSize: 15,
      boxShadow: "0 3px 0 rgba(0,0,0,0.03)", transition: "transform .06s ease, box-shadow .2s ease", width: "100%",
    },
    btnPrimary: {
      padding: "14px 18px", borderRadius: 999, border: "none",
      background: `linear-gradient(180deg, ${theme.accent}, ${theme.accentDeep})`, color: "#fff",
      fontWeight: 900, letterSpacing: 0.3, fontSize: 16,
      boxShadow: "0 10px 20px rgba(255, 160, 200, 0.25)", transition: "transform .06s ease, box-shadow .2s ease", width: "100%",
    },
    muted: { marginTop: 8, fontSize: 12, color: "#B097A6" },
  };

  const AlreadySubscribedModal = () => {
    if (!alreadyOpen) return null;
    const pName = activeSummary?.planName || "현재 구독 중인 플랜";
    const pCode = activeSummary?.planCode ? `(${activeSummary.planCode})` : "";
    return (
      <div style={styles.overlay} role="dialog" aria-modal="true" onMouseDown={closeAlready}>
        <div style={styles.overlayCard} onMouseDown={(e)=>e.stopPropagation()}>
          <h2 style={styles.overlayTitle}>이미 구독 중이에요</h2>
          <div style={styles.overlaySub}>
            현재 계정에 활성화된 구독이 있어 새 결제를 진행할 수 없어요.
          </div>

          <div style={styles.infoBox}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={styles.badge}>플랜</span>
              <b>{pName}</b> <span style={{ fontSize: 12, color: theme.textSub }}>{pCode}</span>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.btn}
              onClick={() => navigate("/member/membership")}
            >
              구독확인으로 이동
            </button>
            <button
              style={styles.btnPrimary}
              onClick={closeAlready}
            >
              확인
            </button>
          </div>

          <div style={styles.muted}>
            플랜 변경은 구독 확인 페이지에서 “구독 변경” 또는 “해지 후 재구독”으로 진행할 수 있어요.
          </div>
        </div>
      </div>
    );
  };

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

      {/* === 이미 구독중 모달 === */}
      {alreadyOpen && <AlreadySubscribedModal />}

      {/* === 공통 모달 (변경 예약 confirm/완료/오류) === */}
      {modal.open && (
        <CommonModal
          {...modal}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/* === 공통 모달 컴포넌트 (PlanDetail 톤) === */
function CommonModal({
  tone = "info",
  title,
  description,
  primaryLabel = "확인",
  secondaryLabel,
  onConfirm,
  onCancel,
  onClose,
}) {
  const palette = {
    info:   { badge: "안내",  bg: "#FFF6FA", border: "#FFD1E5", text: "#6F5663", gradFrom: "#FFC8DB", gradTo: "#FFB3D0" },
    confirm:{ badge: "확인",  bg: "#FFF6FA", border: "#FFD1E5", text: "#6F5663", gradFrom: "#FFC8DB", gradTo: "#FFB3D0" },
    success:{ badge: "완료",  bg: "#F6FFF9", border: "#CFEFD8", text: "#2F6B41", gradFrom: "#98E3B2", gradTo: "#7ED59F" },
    error:  { badge: "오류",  bg: "#FFF5F5", border: "#FFB8B8", text: "#8E2D2D", gradFrom: "#FFB8B8", gradTo: "#FF9B9B" },
  }[tone] || { badge: "알림", bg: "#FFF6FA", border: "#FFD1E5", text: "#6F5663", gradFrom: "#FFC8DB", gradTo: "#FFB3D0" };

  const styles = {
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "grid", placeItems: "center", zIndex: 9999,
    },
    card: {
      width: "min(92vw, 520px)", background: "#fff", borderRadius: 18,
      border: `1px solid ${palette.border}`, boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
      padding: 20,
    },
    badge: {
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      background: palette.bg, border: `1px solid ${palette.border}`,
      color: palette.text, fontSize: 12, fontWeight: 800, marginBottom: 10,
    },
    title: { fontSize: 18, fontWeight: 900, color: "#4A3C44", margin: 0 },
    desc: { marginTop: 8, fontSize: 14, color: "#9A8190", lineHeight: 1.5 },
    actions: { marginTop: 16, display: "grid", gridTemplateColumns: secondaryLabel ? "1fr 1fr" : "1fr", gap: 10 },
    btn: {
      padding: "14px 16px", borderRadius: 999, border: `1px solid ${palette.border}`,
      background: "#fff", color: "#6F5663", fontWeight: 800, fontSize: 15, width: "100%",
      boxShadow: "0 3px 0 rgba(0,0,0,0.03)",
    },
    btnPrimary: {
      padding: "14px 18px", borderRadius: 999, border: "none",
      background: `linear-gradient(180deg, ${palette.gradFrom}, ${palette.gradTo})`,
      color: "#fff", fontWeight: 900, fontSize: 16, width: "100%",
      boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
    },
  };

  // 오버레이 클릭/ESC 닫기
  React.useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div style={styles.card} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.badge}>{palette.badge}</div>
        <h3 style={styles.title}>{title}</h3>
        {description && <div style={styles.desc}>{description}</div>}

        <div style={styles.actions}>
          {secondaryLabel && (
            <button
              type="button"
              style={styles.btn}
              onClick={() => {
                onCancel?.();
                onClose?.();
              }}
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            style={styles.btnPrimary}
            onClick={async () => {
              await onConfirm?.();
              onClose?.();
            }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
