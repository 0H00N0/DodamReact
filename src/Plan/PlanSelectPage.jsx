// src/pages/PlanSelectPage.jsx
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import PlanCard from "./PlanCard";
import { useNavigate, useLocation } from "react-router-dom";
import "./PlanSelectPage.css";
import { useScrollTop } from "./PlanScrollTop";

const NORMAL_ORDER = ["BASIC", "STANDARD", "PREMIUM"];
const PREMIUM_ORDER = ["FAMILY", "VIP"];
const up = (s) => (s ?? "").toString().trim().toUpperCase();

const toKoStatus = (s = "") => {
  const map = {
    ACTIVE: "이용중",
    CANCEL_SCHEDULED: "해지 예약됨",
    CANCELED: "해지 완료",
    PAUSED: "일시중지",
    PENDING: "대기",
    TRIAL: "체험중",
  };
  const key = s.toString().trim().toUpperCase();
  return map[key] || s; // 모르는 값이면 원문 그대로
};

function StatusBadgeKo({ status }) {
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
  };

  return <span style={style}>{map[s]?.label || status}</span>;
}

export default function PlanSelectPage() {
  useScrollTop({ behavior: "auto" });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ======== 신규 구독 / 변경 예약 모드 구분 =========
  const mode = location?.state?.mode || "new"; // "change" | "new"
  const current = location?.state?.currentPlan || null; // { pmId, planCode, planName, status }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/plans");
        const list = Array.isArray(data) ? data : [];
        const toCamel = (obj) => {
          const out = {};
          Object.entries(obj || {}).forEach(([k, v]) => {
            const ck = k ? k.charAt(0).toLowerCase() + k.slice(1) : k;
            out[ck] = v;
          });
          return out;
        };
        setPlans(list.map(toCamel));
      } catch {
        setErr("플랜 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ======== 선택 시 처리 =========
  const handleSelect = async (plan) => {
    if (!plan?.planCode) return;

    // 1️⃣ 신규 구독 모드
    if (mode !== "change") {
      navigate(`/plans/${encodeURIComponent(plan.planCode)}`);
      return;
    }

    // 2️⃣ 구독 변경 모드 — 다음 주기부터 변경 예약
    if (!current?.pmId) {
      alert("잘못된 접근입니다. 다시 시도해주세요.");
      navigate("/member/membership");
      return;
    }

    if (!window.confirm(`'${plan.planName}' 플랜으로 변경을 예약하시겠어요?\n다음 결제일부터 적용됩니다.`)) {
      return;
    }

    try {
      setBusy(true);
      await api.post("/member/subscriptions/change", {
        pmId: current.pmId,
        planCode: plan.planCode,
        months: 1, // 기본 1개월, 사용자가 이후 페이지에서 선택 가능
      });
      alert("변경이 예약되었습니다. 다음 결제일부터 적용됩니다.");
      navigate("/member/membership");
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "구독 변경 예약에 실패했습니다.";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="loading">불러오는 중 입니다…</div>;
  if (err) return <div className="error">{err}</div>;

  // ======== 플랜 정렬 ========
  const normalPlans = plans
    .filter((p) => NORMAL_ORDER.includes(up(p.planCode)))
    .sort(
      (a, b) =>
        NORMAL_ORDER.indexOf(up(a.planCode)) -
        NORMAL_ORDER.indexOf(up(b.planCode))
    );

  const premiumPlans = plans
    .filter((p) => PREMIUM_ORDER.includes(up(p.planCode)))
    .sort(
      (a, b) =>
        PREMIUM_ORDER.indexOf(up(a.planCode)) -
        PREMIUM_ORDER.indexOf(up(b.planCode))
    );

  // ======== 뷰 렌더링 ========
  return (
    <div className="plan-select">
      <section className="intro">
        <h1 className="intro-title">도담 플랜</h1>
        <p className="intro-sub">
          {mode === "change" ? (
            <>
              현재 구독을 변경합니다.{" "}
              <strong>다음 결제일부터</strong> 새 플랜이 적용됩니다.
            </>
          ) : (
            <>
              우리 아이 나이에 맞춰 <strong>부담 없이</strong> 즐기는 장난감 구독.
              <br className="br-md" />
              <span className="intro-highlight">언제든 변경·해지 가능</span>하며, 첫 달부터 혜택을 누려보세요!
              <br />
              <span className="intro-highlight">3,6,12개월 결제시 추가 할인까지!</span>
            </>
          )}
        </p>
      </section>

      {mode === "change" && current && (
  <div
    style={{
      background: "#fff7fa",
      border: "1px solid #ffd6e7",
      borderRadius: 12,
      padding: "12px 18px",
      maxWidth: 720,
      margin: "0 auto 24px",
      fontSize: 14,
      boxShadow: "0 8px 16px rgba(255,111,165,0.1)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#363636",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "#b94b78", fontWeight: 700 }}>현재 구독:</span>
      <span style={{ fontWeight: 600 }}>
        {current.planName} ({current.planCode})
      </span>
      <StatusBadgeKo status={current.status} />
    </div>
  </div>
)}


      <section>
        <h2 className="section-title">일반 플랜</h2>
        <div className="plan-grid grid-3">
          {normalPlans.map((p) => (
            <PlanCard
              key={p.planId ?? p.planCode}
              plan={p}
              onSelect={() => handleSelect(p)}
              disabled={busy}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">프리미엄 플랜</h2>
        <div className="plan-grid grid-2">
          {premiumPlans.map((p) => (
            <PlanCard
              key={p.planId ?? p.planCode}
              plan={p}
              onSelect={() => handleSelect(p)}
              disabled={busy}
            />
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
