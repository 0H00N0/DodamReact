// src/pages/member/Membership.js
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function Membership() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyPmId, setBusyPmId] = useState(null);
  const navigate = useNavigate();

  // ---- Theme (soft pink, PlanDetailPage 톤과 매칭) ----
  const color = {
    bg: "#fff7fa",
    card: "#ffffff",
    border: "#ffd6e7",
    primary: "#ff6fa5",
    primaryDark: "#e85c90",
    text: "#363636",
    muted: "#8a8a8a",
    warnBg: "#fff4e6",
    warnBorder: "#ffd9b3",
    shadow: "0 10px 24px rgba(255,160,200,0.20)",
  };

  // ===== 공통 모달 상태 =====
  const [modal, setModal] = useState({
    open: false,
    title: "",
    description: "",
    tone: "info", // "info" | "confirm" | "success" | "error" | "warn"
    primaryLabel: "확인",
    secondaryLabel: "취소",
    onConfirm: null,
    onCancel: null,
  });

  const openModal = useCallback((cfg) => {
    setModal((m) => ({ ...m, ...cfg, open: true }));
  }, []);
  const closeModal = useCallback(() => {
    setModal((m) => ({ ...m, open: false, onConfirm: null, onCancel: null }));
  }, []);

  // 접근성: ESC로 닫기
  useEffect(() => {
    if (!modal.open) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.open, closeModal]);

  // =========================
  // Date helpers
  // =========================
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtDate = (raw) => {
    if (!raw && raw !== 0) return "-";
    if (Array.isArray(raw) && raw.length >= 3) {
      const y = raw[0], m = raw[1], d = raw[2];
      if (!isNaN(Number(y)) && !isNaN(Number(m)) && !isNaN(Number(d))) {
        return `${y}-${pad2(m)}-${pad2(d)}`;
      }
    }
    if (typeof raw === "object" && raw) {
      const y = raw.year ?? raw.y, m = raw.month ?? raw.m, d = raw.day ?? raw.d;
      if (y && m && d) return `${y}-${pad2(m)}-${pad2(d)}`;
    }
    if (typeof raw === "string") {
      if (raw.includes("T") || raw.includes(":")) {
        const d = new Date(raw);
        if (!isNaN(d)) return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
      }
      const digits = raw.replace(/\D/g, "");
      if (digits.length >= 8) return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
    }
    if (typeof raw === "number") {
      const ms = raw < 2e10 ? raw * 1000 : raw;
      const d = new Date(ms);
      if (!isNaN(d)) return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
    }
    const d = new Date(raw);
    if (!isNaN(d)) return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
    return "-";
  };

  // ===== 백엔드 키 다양성 대응 =====
  const getTermStart = (s) =>
    s.termStart ?? s.pmTermStart ?? s.startAt ?? s.startDate ?? s.piStart ?? s.term_start ?? s.pm_start ?? null;

  const getTermEnd = (s) =>
    s.termEnd ?? s.pmTermEnd ?? s.endAt ?? s.endDate ?? s.piEnd ?? s.term_end ?? s.pm_end ?? null;

  const getNextBillingAt = (s) =>
    s.nextBillingAt ?? s.pmNextBil ?? s.pmNextBill ?? s.nextBillAt ?? s.nextBillingDate ?? s.next_billing_at ?? null;

  const getPlanName = (s, next=false) =>
    next ? (s.nextPlanName ?? s.nextPlan?.planName ?? s.nextPlan?.name ?? s.nextPlanCode ?? null)
         : (s.planName ?? s.plan?.planName ?? s.plan?.name ?? s.planCode ?? null);

  const getPlanCode = (s, next=false) =>
    next ? (s.nextPlanCode ?? s.nextPlan?.planCode ?? null)
         : (s.planCode ?? s.plan?.planCode ?? null);

  const getMonths = (s, next=false) => {
    if (next) {
      return s.nextTermMonth ?? s.nextTerms?.ptermMonth ?? s.nextTerms?.months ??
             s.nextPterm?.months ?? s.nextPtermMonth ?? null;
    }
    return s.termMonth ?? s.terms?.ptermMonth ?? s.terms?.months ?? s.pmCycle ?? null;
  };

  const getAmount = (s, next=false) =>
    next ? (s.nextAmount ?? s.nextPrice?.ppriceAmount ?? s.nextPriceAmount ?? null)
         : (s.amount ?? s.price?.ppriceAmount ?? s.ppriceAmount ?? null);

  const getCurr = (s, next=false) =>
    next ? (s.nextCurrency ?? s.nextPrice?.ppriceCurr ?? s.nextPriceCurr ?? "KRW")
         : (s.currency ?? s.price?.ppriceCurr ?? s.ppriceCurr ?? "KRW");

  const hasScheduledChange = (s) =>
    !!(s.hasScheduledChange) ||
    !!(s.nextPlanId || s.nextPpriceId || s.nextPtermId ||
       s.nextPlan || s.nextPrice || s.nextTerms ||
       s.nextPlanCode || s.nextPlanName || s.nextTermMonth || s.nextPriceAmount);

  const addMonths = (raw, m = 1) => {
    if (raw == null) return null;
    let d = null;
    if (Array.isArray(raw)) {
      if (raw.length >= 3) {
        const [y, M, D, hh = 0, mm = 0, ss = 0] = raw.map((v) => Number(v));
        if (!Number.isNaN(y) && !Number.isNaN(M) && !Number.isNaN(D)) {
          d = new Date(y, M - 1, D, hh, mm, ss);
        }
      }
    } else if (typeof raw === "object") {
      const y = Number(raw.year ?? raw.y);
      const M = Number(raw.month ?? raw.m);
      const D = Number(raw.day ?? raw.d);
      const hh = Number(raw.hour ?? raw.h ?? 0);
      const mm = Number(raw.minute ?? raw.min ?? 0);
      const ss = Number(raw.second ?? raw.s ?? 0);
      if (!Number.isNaN(y) && !Number.isNaN(M) && !Number.isNaN(D)) {
        d = new Date(y, M - 1, D, isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, isNaN(ss) ? 0 : ss);
      }
    } else if (typeof raw === "number") {
      const ms = raw < 2e10 ? raw * 1000 : raw;
      d = new Date(ms);
    } else if (typeof raw === "string") {
      if (raw.includes("T") || raw.includes(":")) d = new Date(raw);
      else {
        const digits = raw.replace(/\D/g, "");
        if (digits.length >= 8) {
          const y = Number(digits.slice(0,4));
          const M = Number(digits.slice(4,6));
          const D = Number(digits.slice(6,8));
          d = new Date(y, M - 1, D);
        } else d = new Date(raw);
      }
    }
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + Number(m || 0));
    return nd.toISOString();
  };

  // data load
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/member/subscriptions/my");
      setSubs(Array.isArray(data) ? data : []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        navigate("/member/login");
        return;
      }
      setErr("구독 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // navigate helpers
  const goChangePlans = (current) => {
    navigate("/plans", {
      state: {
        mode: "change",
        from: "/member/membership",
        currentPlan: {
          pmId: current?.pmId ?? null,
          planCode: current?.planCode ?? null,
          planName: current?.planName ?? null,
          status: current?.status ?? null,
        },
      },
    });
  };
  const goNewPlans = () => navigate("/plans");

  // ===== 모달 기반 캔슬/리버트 플로우 =====
  const scheduleCancel = (pmId) => {
    if (!pmId) return;
    openModal({
      tone: "confirm",
      title: "해지 예약하시겠어요?",
      description: "이번 결제기간 종료 시 자동으로 해지되며, 종료일까지는 이용 가능합니다.",
      primaryLabel: "해지 예약",
      secondaryLabel: "계속 이용",
      onConfirm: async () => {
        try {
          setBusyPmId(pmId);
          await api.post(`/subscriptions/${pmId}/cancel`);
          await load();
          openModal({
            tone: "success",
            title: "해지 예약 완료",
            description: "기간 종료일까지 이용 가능하며, 다음 결제는 진행되지 않습니다.",
            primaryLabel: "확인",
            onConfirm: () => closeModal(),
          });
        } catch (e) {
          const msg =
            e?.response?.data?.error ||
            e?.response?.data?.message ||
            "해지 예약에 실패했습니다.";
          openModal({
            tone: "error",
            title: "해지 예약 실패",
            description: msg,
            primaryLabel: "확인",
            onConfirm: () => closeModal(),
          });
        } finally {
          setBusyPmId(null);
        }
      },
      onCancel: () => closeModal(),
    });
  };

  const revertCancel = (pmId) => {
    if (!pmId) return;
    openModal({
      tone: "confirm",
      title: "해지 예약을 취소할까요?",
      description: "해지 예약이 취소되고, 다음 결제부터 정상적으로 갱신됩니다.",
      primaryLabel: "해지 예약 취소",
      secondaryLabel: "닫기",
      onConfirm: async () => {
        try {
          setBusyPmId(pmId);
          await api.post(`/subscriptions/${pmId}/cancel/revert`);
          await load();
          openModal({
            tone: "success",
            title: "해지 예약이 취소되었습니다",
            description: "계속 이용하실 수 있어요.",
            primaryLabel: "확인",
            onConfirm: () => closeModal(),
          });
        } catch (e) {
          const msg =
            e?.response?.data?.error ||
            e?.response?.data?.message ||
            "해지 예약 취소에 실패했습니다.";
          openModal({
            tone: "error",
            title: "해지 예약 취소 실패",
            description: msg,
            primaryLabel: "확인",
            onConfirm: () => closeModal(),
          });
        } finally {
          setBusyPmId(null);
        }
      },
      onCancel: () => closeModal(),
    });
  };

  // buttons
  const btnBase = {
    borderRadius: 10,
    padding: "10px 16px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "transform .03s ease, box-shadow .2s ease, background .2s ease",
  };
  const btnPrimary = {
    ...btnBase,
    background: color.primary,
    color: "#fff",
    boxShadow: "0 6px 14px rgba(255,111,165,0.25)",
  };
  const btnOutline = {
    ...btnBase,
    background: "#fff",
    color: color.primary,
    border: `1px solid ${color.border}`,
  };
  const btnWarn = {
    ...btnBase,
    background: color.warnBg,
    border: `1px solid ${color.warnBorder}`,
    color: "#8a4b00",
  };
  const btnDisabled = {
    ...btnBase,
    background: "#eee",
    color: "#777",
    cursor: "not-allowed",
  };

  // 상태 컬러 배지
  const StatusBadgeKo = ({ status }) => {
    const s = (status || "").toUpperCase();
    const map = {
      ACTIVE: { label: "이용중", bg: "#ffe7f0", text: "#b94b78", border: "#ffd6e7" },
      CANCEL_SCHEDULED: { label: "해지 예약", bg: "#fff4e6", text: "#a86700", border: "#ffd9b3" },
      CANCELED: { label: "해지 완료", bg: "#f4f4f4", text: "#666", border: "#ddd" },
      PENDING: { label: "대기", bg: "#e9f3ff", text: "#2368b3", border: "#bad6ff" },
      TRIAL: { label: "체험중", bg: "#e8ffef", text: "#308a4c", border: "#b8f5c8" },
      PAUSED: { label: "일시중지", bg: "#fffbe6", text: "#b3a000", border: "#fff2b3" },
    };
    const style = {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      border: `1px solid ${map[s]?.border || "#eee"}`,
      background: map[s]?.bg || "#f4f4f4",
      color: map[s]?.text || "#555",
      marginLeft: 10,
    };
    return <span style={style}>{map[s]?.label || status}</span>;
  };

  if (loading) {
    return (
      <div style={{ padding: 24, display: "grid", placeItems: "center", minHeight: 240 }}>
        불러오는 중...
      </div>
    );
  }
  if (err) {
    return (
      <div style={{ padding: 24, display: "grid", placeItems: "center", minHeight: 240 }}>
        <div style={{ color: "tomato" }}>{err}</div>
        {/* 에러도 모달로 띄우고 싶으면 아래 주석 해제 */}
        {/* <button style={{...btnPrimary, marginTop: 12}} onClick={() => openModal({ tone:'error', title:'오류', description: err, primaryLabel:'닫기', onConfirm: closeModal })}>자세히 보기</button> */}
      </div>
    );
  }

  return (
    <div style={{ background: color.bg }}>
      {/* Centered container */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 60px" }}>
        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, color: color.text, fontSize: 28, letterSpacing: 0.2 }}>
            구독 확인
          </h2>
          <p style={{ marginTop: 8, color: color.muted, fontSize: 14 }}>
            플랜과 결제 일정을 한 곳에서 관리하세요.
          </p>
        </div>

        {/* Cards area */}
        {subs.length === 0 ? (
          <div
            style={{
              background: color.card,
              border: `1px solid ${color.border}`,
              borderRadius: 16,
              padding: 24,
              boxShadow: color.shadow,
              textAlign: "center",
            }}
          >
            <div style={{ color: color.muted, marginBottom: 12 }}>활성화된 구독이 없습니다.</div>
            <button
              style={btnPrimary}
              onClick={goNewPlans}
              onMouseEnter={(e) => (e.currentTarget.style.background = color.primaryDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = color.primary)}
            >
              플랜 보러가기
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {subs.map((s) => {
              const status = (s.status || "").toUpperCase();
              const isActive = status === "ACTIVE";
              const isCancelScheduled = status === "CANCEL_SCHEDULED";
              const isCanceled = status === "CANCELED";

              const termStart = getTermStart(s);
              const termEnd = getTermEnd(s);
              const nextBillingAt = getNextBillingAt(s);

              return (
                <article
                  key={s.pmId ?? `${s.planCode}-${termStart}-${termEnd}`}
                  style={{
                    background: color.card,
                    border: `1px solid ${color.border}`,
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: color.shadow,
                  }}
                >
                  <header
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: color.text }}>
                        {s.planName || "구독상품"} {s.planCode ? `(${s.planCode})` : ""}
                        <StatusBadgeKo status={s.status} />
                      </div>
                      <div style={{ color: color.muted, fontSize: 13, marginTop: 6 }}>
                        결제수단: {s.cardBrand ?? "-"} •••• {s.cardLast4 ?? "----"}
                      </div>
                    </div>

                    {/* 변경 예약 안내 배지 */}
                    {hasScheduledChange(s) && !isCancelScheduled && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#b94b78",
                          background: "#ffe7f0",
                          border: "1px solid #ffd6e7",
                          borderRadius: 999,
                          padding: "4px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        다음 주기에 변경 예약 적용됨
                      </div>
                    )}

                    {/* CTA */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {isActive && (
                        <>
                          <button
                            style={btnOutline}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f8")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                            onClick={() => goChangePlans(s)}
                          >
                            구독 변경
                          </button>
                          <button
                            disabled={busyPmId === s.pmId}
                            style={
                              busyPmId === s.pmId
                                ? { ...btnWarn, opacity: 0.6, cursor: "wait" }
                                : btnWarn
                            }
                            onClick={() => scheduleCancel(s.pmId)}
                          >
                            {busyPmId === s.pmId ? "처리 중..." : "해지 예약"}
                          </button>
                        </>
                      )}
                      {isCancelScheduled && (
                        <>
                          <button style={btnDisabled} disabled title="해지 예약 상태에서는 변경이 제한됩니다.">
                            구독 변경
                          </button>
                          <button
                            disabled={busyPmId === s.pmId}
                            style={
                              busyPmId === s.pmId
                                ? { ...btnPrimary, opacity: 0.6, cursor: "wait" }
                                : btnPrimary
                            }
                            onMouseEnter={(e) => (e.currentTarget.style.background = color.primaryDark)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = color.primary)}
                            onClick={() => revertCancel(s.pmId)}
                          >
                            {busyPmId === s.pmId ? "처리 중..." : "해지 예약 취소"}
                          </button>
                        </>
                      )}
                      {isCanceled && (
                        <button
                          style={btnPrimary}
                          onMouseEnter={(e) => (e.currentTarget.style.background = color.primaryDark)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = color.primary)}
                          onClick={goNewPlans}
                        >
                          재구독하기
                        </button>
                      )}
                    </div>
                  </header>

                  <hr
                    style={{ border: 0, borderTop: `1px dashed ${color.border}`, margin: "14px 0" }}
                  />

                  <section
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    <Field
                      label="이용기간"
                      value={s.termLabel ?? (s.termMonth != null ? `${s.termMonth}개월` : "-")}
                    />
                    <Field label="기간 시작" value={fmtDate(termStart)} />
                    <Field label="기간 종료" value={fmtDate(termEnd)} />
                    <Field label="다음 결제일" value={fmtDate(nextBillingAt)} />
                  </section>

                  {isCancelScheduled && (
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        color: "#8a4b00",
                        background: "#fff8ee",
                        border: `1px dashed ${color.warnBorder}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      해지 예약됨 — 표시된 기간(<b>{fmtDate(termEnd)}</b>)까지 이용 가능하며, 다음
                      결제는 진행되지 않습니다.
                    </div>
                  )}

                  {/* --- 다음 갱신 예정 박스 --- */}
                  {!isCancelScheduled && (() => {
                    const scheduled = hasScheduledChange(s);
                    const nPlanName = getPlanName(s, scheduled);
                    const nPlanCode = getPlanCode(s, scheduled);
                    const months =
                      getMonths(s, scheduled) ?? s.termMonth ?? s.pmCycle ?? 1;
                    const nStart = getNextBillingAt(s);
                    const nEnd = nStart ? addMonths(nStart, months) : null;
                    const nAmount = getAmount(s, scheduled);
                    const nCurr   = getCurr(s, scheduled);
                    if (!nStart) return null;

                    return (
                      <div
                        style={{
                          marginTop: 14,
                          padding: 14,
                          borderRadius: 12,
                          border: `1px dashed ${color.border}`,
                          background: "#fffafd",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <strong>다음 갱신 예정</strong>
                          <span
                            style={{
                              fontSize: 12,
                              padding: "2px 8px",
                              borderRadius: 999,
                              border: `1px solid ${scheduled ? "#ffd6e7" : "#e6e6e6"}`,
                              background: scheduled ? "#ffe7f0" : "#f6f6f6",
                              color: scheduled ? "#b94b78" : "#666",
                            }}
                          >
                            {scheduled ? "변경 예약 적용" : "현재와 동일"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 12,
                          }}
                        >
                          <Field
                            label="플랜"
                            value={`${nPlanName ?? nPlanCode ?? "-"} (${months}개월)`}
                          />
                          <Field
                            label="다음 이용 기간"
                            value={
                              nEnd
                                ? `${fmtDate(nStart)} ~ ${fmtDate(nEnd)}`
                                : `${fmtDate(nStart)} ~ -`
                            }
                          />
                          <Field
                            label="결제 예정 금액"
                            value={
                              nAmount != null
                                ? `${new Intl.NumberFormat("ko-KR").format(nAmount)} ${nCurr || "KRW"}`
                                : "-"
                            }
                          />
                        </div>
                      </div>
                    );
                  })()}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== 공통 모달 ===== */}
      {modal.open && (
        <Modal
          tone={modal.tone}
          title={modal.title}
          description={modal.description}
          primaryLabel={modal.primaryLabel}
          secondaryLabel={modal.secondaryLabel}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel ?? closeModal}
        />
      )}
    </div>
  );
}

// 작은 정보 필드
function Field({ label, value }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 12, color: "#8a8a8a" }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#333" }}>{value ?? "-"}</div>
    </div>
  );
}

/* === PlanDetailPage 톤에 맞춘 공통 모달 컴포넌트 === */
function Modal({
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
    info:   { badge: "정보",  bg: "#FFF6FA", border: "#FFD1E5", text: "#6F5663", gradFrom: "#FFC8DB", gradTo: "#FFB3D0" },
    confirm:{ badge: "확인",  bg: "#FFF6FA", border: "#FFD1E5", text: "#6F5663", gradFrom: "#FFC8DB", gradTo: "#FFB3D0" },
    success:{ badge: "완료",  bg: "#F6FFF9", border: "#CFEFD8", text: "#2F6B41", gradFrom: "#98E3B2", gradTo: "#7ED59F" },
    warn:   { badge: "주의",  bg: "#FFF8EE", border: "#FFD9B3", text: "#8A4B00", gradFrom: "#FFD9B3", gradTo: "#FFC68A" },
    error:  { badge: "오류",  bg: "#FFF5F5", border: "#FFB8B8", text: "#8E2D2D", gradFrom: "#FFB8B8", gradTo: "#FF9B9B" },
  }[tone] || {
    badge: "알림", bg: "#FFF6FA", border: "#FFD1E5", text: "#6F5663", gradFrom: "#FFC8DB", gradTo: "#FFB3D0"
  };

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
                onCancel && onCancel();
                onClose && onClose();
              }}
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            style={styles.btnPrimary}
            onClick={async () => {
              if (onConfirm) await onConfirm();
              onClose && onClose();
            }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
