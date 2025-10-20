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

// 다양한 백엔드 키 대응
const getPlanName = (p) =>
  p?.planName ?? p?.name ?? p?.plan_name ?? p?.planNm ?? p?.title ?? p?.plan?.name ?? p?.plan?.planName ?? null;
const getPlanCode = (p) =>
  p?.planCode ?? p?.code ?? p?.plan_code ?? p?.plan?.planCode ?? null;

export default function PlanSelectPage() {
  useScrollTop({ behavior: "auto" });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location?.state?.mode || "new";               // "change" | "new"
  const current = location?.state?.currentPlan || null;      // { pmId, planCode, planName, status }

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

  const handleSelect = (plan) => {
    const code = getPlanCode(plan);
    if (!code) return;

    if (mode === "change") {
      // ✅ 플랜 상세에서 혜택/가격 확인 후 '변경 예약' 진행
      navigate(`/plans/${encodeURIComponent(code)}`, {
        state: { mode: "change", currentPlan: current },
      });
    } else {
      // 신규 플로우
      navigate(`/plans/${encodeURIComponent(code)}`);
    }
  };

  if (loading) return <div className="loading">불러오는 중 입니다…</div>;
  if (err) return <div className="error">{err}</div>;

  const normalPlans = plans
    .filter((p) => NORMAL_ORDER.includes(up(getPlanCode(p))))
    .sort((a, b) => NORMAL_ORDER.indexOf(up(getPlanCode(a))) - NORMAL_ORDER.indexOf(up(getPlanCode(b))));
  const premiumPlans = plans
    .filter((p) => PREMIUM_ORDER.includes(up(getPlanCode(p))))
    .sort((a, b) => PREMIUM_ORDER.indexOf(up(getPlanCode(a))) - PREMIUM_ORDER.indexOf(up(getPlanCode(b))));

  return (
    <div className="plan-select">
      <section className="intro">
        <h1 className="intro-title">도담 플랜</h1>
        <p className="intro-sub">
          {mode === "change" ? (
            <>현재 구독을 변경합니다. <strong>다음 결제일부터</strong> 새 플랜이 적용됩니다.</>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#363636", flexWrap: "wrap" }}>
            <span style={{ color: "#b94b78", fontWeight: 700 }}>현재 구독:</span>
            <span style={{ fontWeight: 600 }}>{current.planName} ({current.planCode})</span>
          </div>
        </div>
      )}

      <section>
        <h2 className="section-title">일반 플랜</h2>
        <div className="plan-grid grid-3">
          {normalPlans.map((p) => (
            <PlanCard
              key={p.planId ?? getPlanCode(p) ?? getPlanName(p)}
              plan={p}
              onSelect={() => handleSelect(p)}      // “플랜 혜택 보기” 버튼이 이 핸들러를 호출하도록 유지
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
              key={p.planId ?? getPlanCode(p) ?? getPlanName(p)}
              plan={p}
              onSelect={() => handleSelect(p)}
              disabled={busy}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
