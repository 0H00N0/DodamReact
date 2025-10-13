import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function Membership() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyPmId, setBusyPmId] = useState(null);
  const navigate = useNavigate();

  // ---- Theme (soft pink) ----
  const color = {
    bg: "#fff7fa",
    card: "#ffffff",
    border: "#ffd6e7",
    primary: "#ff6fa5",
    primaryDark: "#e85c90",
    text: "#363636",
    muted: "#8a8a8a",
    badgeBg: "#ffe7f0",
    badgeText: "#b94b78",
    warnBg: "#fff4e6",
    warnBorder: "#ffd9b3",
    shadow: "0 10px 24px rgba(255,111,165,0.15)",
  };

  // YYYY-MM-DD formatter (ISO/epoch/yyyymmdd 모두 대응)
  const fmtDate = (raw) => {
    if (!raw) return "-";
    if (typeof raw === "string" && raw.includes("T")) {
      const d = new Date(raw);
      if (!isNaN(d)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }
    }
    const s = String(raw).replace(/\D/g, "");
    if (s.length >= 8) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    const n = Number(raw);
    if (!isNaN(n)) {
      const d = new Date(n);
      if (!isNaN(d)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }
    }
    return "-";
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

  // cancel schedule
  const scheduleCancel = async (pmId) => {
    if (!pmId) return;
    if (!window.confirm("이번 결제기간 종료 시 자동으로 해지됩니다. 진행할까요?")) return;
    try {
      setBusyPmId(pmId);
      await api.post(`/subscriptions/${pmId}/cancel`);
      await load();
      alert("해지 예약이 완료되었습니다. 기간 종료일까지 이용 가능합니다.");
    } catch (e) {
      const msg =
        e?.response?.data?.error || e?.response?.data?.message || "해지 예약에 실패했습니다.";
      alert(msg);
    } finally {
      setBusyPmId(null);
    }
  };

  // revert cancel
  const revertCancel = async (pmId) => {
    if (!pmId) return;
    if (!window.confirm("해지 예약을 취소하고 계속 이용하시겠어요?")) return;
    try {
      setBusyPmId(pmId);
      await api.post(`/subscriptions/${pmId}/cancel/revert`);
      await load();
      alert("해지 예약이 취소되었습니다. 계속 이용하실 수 있어요.");
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "해지 예약 취소에 실패했습니다.";
      alert(msg);
    } finally {
      setBusyPmId(null);
    }
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
  const btnPrimaryHover = { background: color.primaryDark };
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

  // status badge
  const StatusBadge = ({ status }) => {
    const s = (status || "").toUpperCase();
    const base = {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      marginLeft: 10,
      border: `1px solid ${color.border}`,
    };
    if (s === "ACTIVE")
      return (
        <span style={{ ...base, background: color.badgeBg, color: color.badgeText }}>
          이용중
        </span>
      );
    if (s === "CANCEL_SCHEDULED")
      return (
        <span
          style={{
            ...base,
            background: "#fff0e0",
            color: "#8a4b00",
            border: `1px solid ${color.warnBorder}`,
          }}
        >
          해지 예약됨
        </span>
      );
    if (s === "CANCELED")
      return (
        <span style={{ ...base, background: "#f4f4f4", color: "#666", borderColor: "#e5e5e5" }}>
          해지완료
        </span>
      );
    return <span style={{ ...base }}>{status}</span>;
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
      </div>
    );
  }

  return (
    <div style={{ background: color.bg }}>
      {/* Centered container */}
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "32px 20px 60px",
        }}
      >
        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, color: color.text, fontSize: 28, letterSpacing: 0.2 }}>
            내 구독
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
              onMouseEnter={(e) => (e.currentTarget.style.background = color.primaryDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = color.primary)}
              onClick={goNewPlans}
            >
              플랜 보러가기
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16,
            }}
          >
            {subs.map((s) => {
              const status = (s.status || "").toUpperCase();
              const isActive = status === "ACTIVE";
              const isCancelScheduled = status === "CANCEL_SCHEDULED";
              const isCanceled = status === "CANCELED";

              return (
                <article
                  key={s.pmId}
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
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 18,
                          color: color.text,
                        }}
                      >
                        {s.planName || "구독상품"} {s.planCode ? `(${s.planCode})` : ""}
                        <StatusBadge status={s.status} />
                      </div>
                      <div style={{ color: color.muted, fontSize: 13, marginTop: 6 }}>
                        결제수단: {s.cardBrand ?? "-"} •••• {s.cardLast4 ?? "----"}
                      </div>
                    </div>
                    {/* CTA (desktop) */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {isActive && (
                        <>
                          <button
                            style={btnOutline}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#fff5f8")
                            }
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
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = color.primaryDark)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = color.primary)
                            }
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

                  <hr style={{ border: 0, borderTop: `1px dashed ${color.border}`, margin: "14px 0" }} />

                  <section
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    <Field label="이용기간" value={s.termLabel ?? (s.termMonth != null ? `${s.termMonth}개월` : "-")} />
                    <Field label="기간 시작" value={fmtDate(s.termStart)} />
                    <Field label="기간 종료" value={fmtDate(s.termEnd)} />
                    <Field label="다음 결제일" value={fmtDate(s.nextBillingAt)} />
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
                      해지 예약됨 — 표시된 기간(<b>{fmtDate(s.termEnd)}</b>)까지 이용 가능하며, 다음 결제는
                      진행되지 않습니다.
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
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
