// src/Plan/PlanCheckout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// default import (중요)
import PortOne from "@portone/browser-sdk/v2";
import { billingKeysApi, paymentsApi, subscriptionApi } from "../utils/api";

export default function CheckoutPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(search);

  const planCode = qs.get("code") || qs.get("planCode") || "";
  const months = Number(qs.get("months") || qs.get("term") || 1) || 1;

  const [cards, setCards] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [debug, setDebug] = useState(""); // F12 없이 화면 디버그

  const selectedCard = useMemo(
    () => (cards && cards.length > 0 ? cards[selectedIdx] : null),
    [cards, selectedIdx]
  );

  const norm = (v) => String(v || "").trim().toUpperCase();
  const isSuccess = (s) => ["PAID", "SUCCEEDED", "SUCCESS"].includes(norm(s));
  const isFail = (s) => ["FAILED", "FAIL"].includes(norm(s));
  const isCanceled = (s) => ["CANCELED", "CANCELLED"].includes(norm(s));
  const isPending = (s) => ["ACCEPTED", "PENDING", "PROCESSING"].includes(norm(s));

  async function pollStatus(paymentId, maxTries = 12, intervalMs = 1500) {
    for (let i = 0; i < maxTries; i++) {
      try {
        const r = await paymentsApi.lookup(paymentId);
        const s = norm(r?.data?.status || r?.data?.result);
        if (isSuccess(s)) return "PAID";
        if (isFail(s)) return "FAILED";
        if (isCanceled(s)) return "CANCELED";
      } catch (_) {}
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return "TIMEOUT";
  }

  async function loadCards() {
    try {
      const res = await billingKeysApi.list();
      const arr = Array.isArray(res?.data) ? res.data : [];
      setCards(arr);
      setMsg(arr.length === 0 ? "등록된 카드가 없습니다. 먼저 카드 등록을 진행하세요." : "");
    } catch (e) {
      setMsg("카드 목록을 불러오지 못했습니다.");
      setDebug((d) => d + `\n[CARD LIST FAIL] ${e?.message || e}`);
    }
  }

  useEffect(() => {
    loadCards();
    // ✅ 리다이렉트 복귀 목적지 저장 (URL & 쿼리 모두)
    try {
      sessionStorage.setItem("lastCheckoutUrl", window.location.href);
      sessionStorage.setItem("lastCheckoutQuery", window.location.search || "");
    } catch {}
  }, []);

  // ===== 카드(빌링키) 등록 =====
  async function handleRegisterCard() {
    if (busy) return;
    setBusy(true);
    setMsg("카드 등록을 시작합니다…");
    setDebug(""); // 초기화
    try {
      const storeId = process.env.REACT_APP_PORTONE_STORE_ID;
      const channelKey = process.env.REACT_APP_PORTONE_CHANNEL_KEY;
      const billingKeyMethod = process.env.REACT_APP_BILLING_METHOD || "CARD";
      if (!storeId) {
        setMsg("환경변수(REACT_APP_PORTONE_STORE_ID)가 설정되지 않았습니다.");
        return;
      }
      const redirectUrl = `${window.location.origin}/#/billing-keys/redirect`;

      // 복귀 목적지 재저장(탭 전환 대비)
      try {
        sessionStorage.setItem("lastCheckoutUrl", window.location.href);
        sessionStorage.setItem("lastCheckoutQuery", window.location.search || "");
      } catch {}

      // SDK 함수 폴백
      const hasIssueFn = typeof PortOne?.requestIssueBillingKey === "function";
      const callDesc = hasIssueFn ? "requestIssueBillingKey" : "requestPayment(BILLING)";
      setDebug((d) => d + `\n[SDK] Using ${callDesc}`);

      let resp;
      if (hasIssueFn) {
        resp = await PortOne.requestIssueBillingKey({
          storeId,
          channelKey,
          redirectUrl,
          billingKeyMethod, // "CARD"
        });
      } else {
        resp = await PortOne.requestPayment({
          storeId,
          channelKey,
          paymentId: `bk_${Date.now()}`,
          orderName: "카드 등록(빌링키 발급)",
          totalAmount: 100,
          currency: "KRW",
          customer: { id: "me" }, // 세션/회원 ID로 치환 가능
          method: { type: "CARD", paymentPlan: "BILLING" },
          redirectUrl,
        });
      }

      setDebug((d) => d + `\n[SDK RESP] ${safeJ(resp)}`);

      const statusLike = String(resp?.status || resp?.billingKey || "").toUpperCase();

      // 1) 오버레이(즉시 발급): billingKey가 있고 그 값이 NEEDS_CONFIRMATION이 아님
      if (resp?.billingKey && statusLike !== "NEEDS_CONFIRMATION" && !resp.billingKey.startsWith("billing-issue-token")) {
        await billingKeysApi.register({
          billingKey: resp.billingKey,
          rawJson: JSON.stringify(resp),
        });
        setMsg("카드 등록 완료.");
        await loadCards();
        return;
      }

      // 2) 본인인증 추가 단계: NEEDS_CONFIRMATION + billingIssueToken
      if (statusLike === "NEEDS_CONFIRMATION" && resp?.billingIssueToken) {
        const url = new URL(redirectUrl);
        url.searchParams.set("transactionType", "ISSUE_BILLING_KEY");
        url.searchParams.set("status", "NEEDS_CONFIRMATION");
        url.searchParams.set("billingIssueToken", resp.billingIssueToken);
        setMsg("본인인증 단계로 이동합니다…");
        setDebug((d) => d + `\n[REDIRECT] ${url.toString()}`);
        window.location.assign(url.toString());
        return;
      }

      // 3) 나머지: 취소/실패
      setMsg("카드 등록이 취소되었거나 실패했습니다.");
      setDebug((d) => d + `\n[FAIL PATH] statusLike=${statusLike} billingKey=${resp?.billingKey}`);
    } catch (e) {
      setMsg("카드 등록 실패 (네트워크/서버).");
      setDebug((d) => d + `\n[ERROR] ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  // ===== 인보이스 생성 + 결제 확인 =====
  async function handleStart() {
    if (busy || !selectedCard) return;
    setBusy(true);
    setMsg("인보이스 생성 중…");
    try {
      const invRes = await subscriptionApi.start({
        planCode,
        months,
        billingKey: selectedCard.billingKey,
      });
      const invoiceId =
        invRes?.data?.invoiceId ??
        invRes?.data?.id ??
        invRes?.data?.piId ??
        invRes?.data?.pi_id;
      if (!invoiceId) {
        setMsg("인보이스 생성 실패: ID 없음");
        return;
      }
      setMsg(`인보이스 생성 완료 (ID: ${invoiceId}). 결제를 확인합니다…`);

      const payRes = await paymentsApi.confirm({ invoiceId });
      const httpStatus = payRes?.status;
      const status = norm(payRes?.data?.status || payRes?.data?.result);
      const paymentId =
        payRes?.data?.paymentId || payRes?.data?.id || payRes?.data?.payment_id;

      if (isSuccess(status)) {
        navigate(`/plan/checkout/result?invoiceId=${invoiceId}&paymentId=${paymentId}&status=PAID`);
        return;
      }
      if (httpStatus === 202 || isPending(status)) {
        setMsg("결제 승인 대기 중… (PENDING)");
        const final = await pollStatus(paymentId);
        navigate(`/plan/checkout/result?invoiceId=${invoiceId}&paymentId=${paymentId}&status=${final}`);
        return;
      }
      if (isFail(status) || isCanceled(status)) {
        navigate(`/plan/checkout/result?invoiceId=${invoiceId}&paymentId=${paymentId}&status=${status}`);
        return;
      }
      navigate(`/plan/checkout/result?invoiceId=${invoiceId}&paymentId=${paymentId || ""}&status=UNKNOWN`);
    } catch (e) {
      setMsg("결제에 실패했습니다. 다시 시도해 주세요.");
      setDebug((d) => d + `\n[CHECKOUT ERROR] ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>구독 결제</h2>
      <div style={{ marginBottom: 12, color: "#666" }}>
        선택한 플랜: <b>{planCode || "-"}</b> / 기간: <b>{months}</b>개월
      </div>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>결제수단</h3>
        {cards.length === 0 ? (
          <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
            등록된 카드가 없습니다. 아래 버튼으로 먼저 등록하세요.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {cards.map((c, idx) => (
              <li
                key={c.billingKey || idx}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 12px",
                  border: "1px solid " + (idx === selectedIdx ? "#4096ff" : "#ddd"),
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: idx === selectedIdx ? "#4096ff" : "#bbb",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {c.brand || c.issuerName || "카드"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {c.bin
                      ? `${c.bin}-****-****-${c.last4 || "****"}`
                      : c.last4
                      ? `****-****-****-${c.last4}`
                      : ""}
                    {c.pg ? ` · ${c.pg}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleRegisterCard} disabled={busy} style={btnStyle}>
          {busy ? "처리 중…" : "카드 등록"}
        </button>
        <button onClick={handleStart} disabled={busy || !selectedCard} style={btnPrimaryStyle}>
          {busy ? "처리 중…" : "구독 시작"}
        </button>
      </div>

      {msg && <div style={{ marginTop: 12, color: "#333" }}>{msg}</div>}

      {debug && (
        <pre
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f7f7f7",
            border: "1px solid #eee",
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
{debug}
        </pre>
      )}
    </div>
  );
}

const btnStyle = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};
const btnPrimaryStyle = {
  ...btnStyle,
  border: "1px solid #4096ff",
  background: "#4096ff",
  color: "#fff",
};

// 안전한 JSON 문자열화
function safeJ(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
