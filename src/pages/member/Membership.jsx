import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function Membership() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyPmId, setBusyPmId] = useState(null); // 버튼 진행 상태
  const navigate = useNavigate();

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

  // 플랜 변경
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

  // 신규 구독
  const goNewPlans = () => navigate("/plans");

  // 기간말 해지 예약
  const scheduleCancel = async (pmId) => {
    if (!pmId) return;
    if (!window.confirm("이번 결제기간 종료 시 자동으로 해지됩니다. 진행할까요?")) return;

    try {
      setBusyPmId(pmId);
      await api.post(`/subscriptions/${pmId}/cancel`);
      await load();
      alert("해지 예약이 완료되었습니다. 기간 종료일까지 이용 가능합니다.");
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || "해지 예약에 실패했습니다.";
      alert(msg);
    } finally {
      setBusyPmId(null);
    }
  };

  // 기간말 해지 예약 취소
  const revertCancel = async (pmId) => {
    if (!pmId) return;
    if (!window.confirm("해지 예약을 취소하고 계속 이용하시겠어요?")) return;

    try {
      setBusyPmId(pmId);
      await api.post(`/subscriptions/${pmId}/cancel/revert`);
      await load();
      alert("해지 예약이 취소되었습니다. 계속 이용하실 수 있어요.");
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || "해지 예약 취소에 실패했습니다.";
      alert(msg);
    } finally {
      setBusyPmId(null);
    }
  };

  // 공통 버튼 스타일
  const btn = {
    borderRadius: 6,
    padding: "6px 14px",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1.2,
  };
  const btnPrimary = { ...btn, background: "#3a78f2", color: "#fff" };
  const btnWarn = {
    ...btn,
    background: "#fff4e6",
    color: "#8a4b00",
    border: "1px solid #ffd9b3",
  };
  const btnDisabled = {
    ...btn,
    background: "#ddd",
    color: "#666",
    cursor: "not-allowed",
  };

  // 상태 배지
  const StatusBadge = ({ status }) => {
    const s = (status || "").toUpperCase();
    const base = {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 8,
      fontSize: 12,
      marginLeft: 8,
    };
    if (s === "ACTIVE")
      return (
        <span style={{ ...base, background: "#e6f7e6", color: "#207520", border: "1px solid #b8e0b8" }}>
          이용중
        </span>
      );
    if (s === "CANCEL_SCHEDULED")
      return (
        <span style={{ ...base, background: "#fff4e6", color: "#8a4b00", border: "1px solid #ffd9b3" }}>
          해지 예약됨
        </span>
      );
    if (s === "CANCELED")
      return (
        <span style={{ ...base, background: "#f0f0f0", color: "#666", border: "1px solid #ddd" }}>
          해지완료
        </span>
      );
    return (
      <span style={{ ...base, background: "#f5f5f5", color: "#444", border: "1px solid #eee" }}>
        {status}
      </span>
    );
  };

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (err) return <div style={{ padding: 24, color: "tomato" }}>{err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>내 구독</h2>

      {subs.length === 0 ? (
        <div style={{ marginBottom: 12 }}>
          활성화된 구독이 없습니다.
          <div style={{ marginTop: 12 }}>
            <button style={btnPrimary} onClick={goNewPlans}>
              플랜 보러가기
            </button>
          </div>
        </div>
      ) : (
        subs.map((s) => {
          const status = (s.status || "").toUpperCase();
          const isActive = status === "ACTIVE";
          const isCancelScheduled = status === "CANCEL_SCHEDULED";
          const isCanceled = status === "CANCELED";

          return (
            <div
              key={s.pmId}
              style={{
                border: "1px solid #444",
                borderRadius: 12,
                padding: 16,
                margin: "12px 0",
                background: isCancelScheduled ? "#fffaf3" : isCanceled ? "#fafafa" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {s.planName || "구독상품"} {s.planCode ? `(${s.planCode})` : ""}
                  <StatusBadge status={s.status} />
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <div>이용기간: {s.termLabel ?? (s.termMonth != null ? `${s.termMonth}개월` : "-")}</div>
                <div>기간: {s.termStart ?? "-"} ~ {s.termEnd ?? "-"}</div>
                <div>다음 결제일: {s.nextBillingAt ?? "-"}</div>
                <div>결제수단: {s.cardBrand ?? "-"} •••• {s.cardLast4 ?? "----"}</div>
              </div>

              {/* 안내 문구 (해지 예약 시) */}
              {isCancelScheduled && (
                <div style={{ marginTop: 10, fontSize: 13, color: "#8a4b00" }}>
                  해지 예약됨 — 표시된 기간(<b>{s.termEnd ?? "-"}</b>)까지 이용 가능하며, 다음 결제는 진행되지 않습니다.
                </div>
              )}

              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {/* 활성 상태: 변경/해지 예약 노출 */}
                {isActive && (
                  <>
                    <button style={btnPrimary} onClick={() => goChangePlans(s)}>
                      구독 변경
                    </button>
                    <button
                      onClick={() => scheduleCancel(s.pmId)}
                      disabled={busyPmId === s.pmId}
                      style={{
                        ...(busyPmId === s.pmId ? { ...btnWarn, opacity: 0.6, cursor: "wait" } : btnWarn),
                      }}
                    >
                      {busyPmId === s.pmId ? "처리 중..." : "해지 예약"}
                    </button>
                  </>
                )}

                {/* 해지 예약된 상태: 변경 비활성화 + ‘해지 예약 취소’ 제공 */}
                {isCancelScheduled && (
                  <>
                    <button style={btnDisabled} disabled title="해지 예약 상태에서는 변경이 제한됩니다.">
                      구독 변경
                    </button>
                    <button
                      onClick={() => revertCancel(s.pmId)}
                      disabled={busyPmId === s.pmId}
                      style={{
                        ...(busyPmId === s.pmId ? { ...btnPrimary, opacity: 0.6, cursor: "wait" } : btnPrimary),
                      }}
                    >
                      {busyPmId === s.pmId ? "처리 중..." : "해지 예약 취소"}
                    </button>
                  </>
                )}

                {/* 해지완료: 재구독 버튼 */}
                {isCanceled && (
                  <button style={btnPrimary} onClick={goNewPlans}>
                    재구독하기
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
