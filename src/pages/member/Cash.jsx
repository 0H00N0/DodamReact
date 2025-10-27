// src/member/Cash.jsx
import React, { useEffect, useState } from "react";
import { api, billingKeysApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import PortOne from "@portone/browser-sdk/v2";
import "./MemberTheme.css";

export default function Cash() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get("/billing-keys");
      setMethods(Array.isArray(data) ? data : []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        navigate("/member/login");
        return;
      }
      setErr("결제수단을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [navigate]);

  // ✅ 카드 등록 (취소/성공/실패 정확 분기)
  const handleRegisterCard = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const storeId = process.env.REACT_APP_PORTONE_STORE_ID;
      const channelKey = process.env.REACT_APP_PORTONE_CHANNEL_KEY;
      const billingKeyMethod = process.env.REACT_APP_BILLING_METHOD || "CARD";
      if (!storeId) {
        alert("PortOne 설정(storeId)이 없습니다.");
        return;
      }

      const redirectUrl = `${window.location.origin}/#/billing-keys/redirect`;
      try { sessionStorage.setItem("lastCheckoutUrl", window.location.href); } catch {}

      let resp;
      try {
        if (typeof PortOne?.requestIssueBillingKey === "function") {
          resp = await PortOne.requestIssueBillingKey({
            storeId, channelKey, redirectUrl, billingKeyMethod,
          });
        } else {
          // 구버전 호환
          resp = await PortOne.requestPayment({
            storeId, channelKey,
            paymentId: `bk_${Date.now()}`,
            orderName: "카드 등록(빌링키 발급)",
            totalAmount: 100, currency: "KRW",
            customer: { id: "me" },
            method: { type: "CARD", paymentPlan: "BILLING" },
            redirectUrl,
          });
        }
      } catch (e) {
        // X버튼/ESC/배경 클릭 등 사용자 취소
        const canceledCodes = ["CANCELED","CANCELLED","USER_CANCEL","USER_CANCELLED","PAY_PROCESS_ABORTED"];
        const msg = String(e?.code || e?.message || "").toUpperCase();
        if (canceledCodes.some(c => msg.includes(c))) return; // 조용히 종료
        console.error(e);
        alert("카드 등록 중 오류가 발생했습니다.");
        return;
      }

      // ---- 정상 응답 처리 ----
      const statusLike = String(resp?.status || resp?.billingKey || "").toUpperCase();
      const codeLike   = String(resp?.code || "").toUpperCase();
      const canceled = ["CANCELED","CANCELLED","USER_CANCEL","USER_CANCELLED"].includes(statusLike)
                    || ["CANCELED","CANCELLED","USER_CANCEL","USER_CANCELLED"].includes(codeLike);
      if (canceled) return; // 취소는 알림 없이 종료

      // 즉시 빌링키가 넘어온 경우 → 서버 등록 후 목록 갱신 (알림 X)
      if (
        resp?.billingKey &&
        statusLike !== "NEEDS_CONFIRMATION" &&
        !String(resp.billingKey).startsWith("billing-issue-token")
      ) {
        await billingKeysApi.register({
          billingKey: resp.billingKey,
          rawJson: JSON.stringify(resp),
        });
        await load();
        return;
      }

      // 추가 확정 필요 → 리다이렉트
      if (statusLike === "NEEDS_CONFIRMATION" && resp?.billingIssueToken) {
        const url = new URL(redirectUrl);
        url.searchParams.set("transactionType", "ISSUE_BILLING_KEY");
        url.searchParams.set("status", "NEEDS_CONFIRMATION");
        url.searchParams.set("billingIssueToken", resp.billingIssueToken);
        window.location.assign(url.toString());
        return;
      }

      // 그 외는 실패로 안내
      alert("카드 등록을 완료하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const goStartSubscribe = () => {
    // 필요 시 특정 플랜: navigate("/plan/checkout/BASIC/1");
    navigate("/plan/checkout");
  };

  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (err) return <div style={{ padding: 24, color: "tomato" }}>{err}</div>;

  const card = { background: "#fff", border: "1px solid #FFE3EE", borderRadius: 16, padding: 24 };
  const row = { marginTop: 16 };
  const btnBase = {
    padding: "16px 18px",
    borderRadius: 999,
    fontWeight: 800,
    letterSpacing: 0.2,
    fontSize: 16,
    width: "100%",
  };
  const btn = { ...btnBase, border: "1px solid #FFD1E5", background: "#fff", color: "#6F5663" };
  const btnPrimary = { ...btnBase, border: "none", background: "linear-gradient(180deg, #FFC8DB, #FFB3D0)", color: "#fff", boxShadow: "0 10px 20px rgba(255, 160, 200, 0.25)" };
  const btnDisabled = { opacity: 0.6, pointerEvents: "none" };

  return (
    <div className="member-page">
      <div className="m-card wide" style={card}>
        <h2 style={{ marginBottom: 16 }}>내 결제수단</h2>

        {methods.length === 0 ? (
          <div style={{ padding: 16, borderRadius: 12, border: "1.5px dashed #FFD1E5", background: "#FFF6FA", color: "#9A8190", textAlign: "center" }}>
            등록된 결제수단이 없습니다. 아래에서 먼저 등록해 주세요.
          </div>
        ) : (
          <ul style={{ paddingLeft: 16 }}>
            {methods.map((m) => (
              <li key={m.id || m.payId || m.billingKey} style={{ marginBottom: 8 }}>
                {m.brand || m.pg || "카드"} •••• {m.last4 || "----"}
                {m.createdAt ? ` / 등록: ${m.createdAt}` : ""}
              </li>
            ))}
          </ul>
        )}

        {/* 버튼 영역 */}
        <div style={{ ...row, display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 10, marginTop: 24 }}>
          <button type="button" onClick={handleRegisterCard} style={{ ...btn, ...(busy ? btnDisabled : {}) }} disabled={busy}>
            카드 등록
          </button>
          <button type="button" onClick={goStartSubscribe} style={{ ...btnPrimary, ...(methods.length === 0 ? btnDisabled : {}) }} disabled={methods.length === 0}>
            구독 시작
          </button>
        </div>
      </div>
    </div>
  );
}
