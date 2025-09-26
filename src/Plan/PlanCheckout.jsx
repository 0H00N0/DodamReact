// src/Plan/PlanCheckout.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [debug, setDebug] = useState("");

  const selectedCard = useMemo(
    () => (cards && cards.length > 0 ? cards[selectedIdx] : null),
    [cards, selectedIdx]
  );
  const selectedPayId = selectedCard?.payId ?? selectedCard?.id ?? null;

  // ===== 상태 정규화/판별 =====
  const norm = (v) => String(v || "").trim().toUpperCase();
  const isSuccess = (s) => ["PAID","SUCCEEDED","SUCCESS","PARTIAL_PAID"].includes(norm(s));

  // ===== 무기한 폴링 제어 =====
  const alive = useRef(true);
  const elapsedSec = useRef(0);
  const elapsedTick = useRef(null);
  const pollTimer = useRef(null);
  const startedAt = useRef(null);
  const [uiStatus, setUiStatus] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    return () => {
      alive.current = false;
      if (elapsedTick.current) clearInterval(elapsedTick.current);
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  const backoffMs = () => {
    const s = elapsedSec.current;
    if (s < 60) return 2000;
    if (s < 300) return 5000;
    return 15000;
  };

  const startElapsed = () => {
    if (elapsedTick.current) clearInterval(elapsedTick.current);
    elapsedSec.current = 0;
    startedAt.current = Date.now();
    elapsedTick.current = setInterval(() => {
      elapsedSec.current = Math.floor((Date.now() - startedAt.current) / 1000);
      setMsg(`결제 진행중… (경과 ${elapsedSec.current}초)`);
    }, 1000);
  };

  const stopElapsed = () => {
    if (elapsedTick.current) clearInterval(elapsedTick.current);
  };

  // ★ 서버 폴링: 반드시 /payments/{paymentId} 사용
  const pollOnce = async (pid) => {
    try {
      const r = await paymentsApi.lookup(pid);
      const s = norm(r?.data?.status || r?.data?.result);
      const done = Boolean(r?.data?.done);
      setUiStatus(s || "UNKNOWN");

      if (done) {
        stopElapsed();
        if (isSuccess(s)) {
          setMsg("결제 완료되었습니다.");
          navigate(`/plan/checkout/result?invoiceId=${r?.data?.invoiceId ?? ""}&paymentId=${pid}&status=${s}`);
        } else {
          setMsg("결제가 완료되지 않았습니다.");
          navigate(`/plan/checkout/result?invoiceId=${r?.data?.invoiceId ?? ""}&paymentId=${pid}&status=${s}`);
        }
        return true;
      }
      setDebug((d) => d + `\n[POLL] paymentId=${pid} status=${s}`);
      return false;
    } catch (e) {
      setDebug((d) => d + `\n[POLL ERROR] ${e?.message || e}`);
      return false;
    }
  };

  const pollForeverUntilPaid = async (pid) => {
    startElapsed();
    setMsg("결제 진행중… (경과 0초)");
    setUiStatus("PENDING");

    const loop = async () => {
      if (!alive.current) return;
      const done = await pollOnce(pid);
      if (done) return;
      pollTimer.current = setTimeout(loop, backoffMs());
    };
    loop();
  };

  // =========================
  // 카드(빌링키) 목록 로드
  // =========================
  async function loadCards() {
    try {
      const res = await billingKeysApi.list();
      const arr = Array.isArray(res?.data) ? res.data : [];

      const normalized = arr.map((c, i) => ({
        payId: c.payId ?? c.id ?? null,
        billingKey: c.billingKey ?? c.key ?? null,
        brand: c.brand ?? c.issuerName ?? null,
        bin: c.bin ?? null,
        last4: c.last4 ?? null,
        pg: c.pg ?? c.pgProvider ?? null,
        _raw: c,
        _i: i,
      }));

      setCards(normalized);
      setMsg(
        normalized.length === 0
          ? "등록된 카드가 없습니다. 먼저 카드 등록을 진행하세요."
          : ""
      );
    } catch (e) {
      setMsg("카드 목록을 불러오지 못했습니다.");
      setDebug((d) => d + `\n[CARD LIST FAIL] ${e?.message || e}`);
    }
  }

  useEffect(() => {
    loadCards();
    try {
      sessionStorage.setItem("lastCheckoutUrl", window.location.href);
      sessionStorage.setItem("lastCheckoutQuery", window.location.search || "");
    } catch {}
  }, []);

  // =========================
  // 카드(빌링키) 등록
  // =========================
  async function handleRegisterCard() {
    if (busy) return;
    setBusy(true);
    setMsg("카드 등록을 시작합니다…");
    setDebug("");
    try {
      const storeId = process.env.REACT_APP_PORTONE_STORE_ID;
      const channelKey = process.env.REACT_APP_PORTONE_CHANNEL_KEY;
      const billingKeyMethod = process.env.REACT_APP_BILLING_METHOD || "CARD";
      if (!storeId) {
        setMsg("환경변수(REACT_APP_PORTONE_STORE_ID)가 설정되지 않았습니다.");
        return;
      }
      const redirectUrl = `${window.location.origin}/#/billing-keys/redirect`;

      try {
        sessionStorage.setItem("lastCheckoutUrl", window.location.href);
        sessionStorage.setItem("lastCheckoutQuery", window.location.search || "");
      } catch {}

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
          customer: { id: "me" },
          method: { type: "CARD", paymentPlan: "BILLING" },
          redirectUrl,
        });
      }

      setDebug((d) => d + `\n[SDK RESP] ${safeJ(resp)}`);

      const statusLike = String(resp?.status || resp?.billingKey || "").toUpperCase();

      // 1) 오버레이 즉시 발급
      if (
        resp?.billingKey &&
        statusLike !== "NEEDS_CONFIRMATION" &&
        !resp.billingKey.startsWith("billing-issue-token")
      ) {
        await billingKeysApi.register({
          billingKey: resp.billingKey,
          rawJson: JSON.stringify(resp),
        });
        setMsg("카드 등록 완료.");
        await loadCards();
        return;
      }

      // 2) 본인인증 추가 단계
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

      // 3) 나머지
      setMsg("카드 등록이 취소되었거나 실패했습니다.");
      setDebug(
        (d) => d + `\n[FAIL PATH] statusLike=${statusLike} billingKey=${resp?.billingKey}`
      );
    } catch (e) {
      setMsg("카드 등록 실패 (네트워크/서버).");
      setDebug((d) => d + `\n[ERROR] ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  // =========================
  // 인보이스 생성 + 결제 시작(폴링)
  // =========================
  async function handleStart() {
    if (busy || !selectedCard) return;
    setBusy(true);
    setDebug("");
    setMsg("인보이스 생성 중…");
    try {
      // 1) 인보이스 생성 (선택 카드 식별자 전달)
      const payload = { planCode, months };
      if (selectedPayId) payload.payId = selectedPayId;
      else if (selectedCard?.billingKey) payload.billingKey = selectedCard.billingKey;

      const invRes = await subscriptionApi.start(payload);

      const invoiceId =
        invRes?.data?.invoiceId ??
        invRes?.data?.id ??
        invRes?.data?.piId ??
        invRes?.data?.pi_id;

      if (!invoiceId) {
        setMsg("인보이스 생성 실패: ID 없음");
        setDebug((d) => d + `\n[INV RESP] ${safeJ(invRes?.data)}`);
        return;
      }

      // 2) 결제 트리거
      setMsg(`인보이스 생성 완료 (ID: ${invoiceId}). 결제를 시작합니다…`);
      const payRes = await paymentsApi.confirm({ invoiceId });

      const pid =
        payRes?.data?.paymentId || payRes?.data?.id || payRes?.data?.payment_id;
      if (!pid) {
        setMsg("결제 시작 실패: paymentId 없음");
        setDebug((d) => d + `\n[CONFIRM RESP] ${safeJ(payRes?.data)}`);
        return;
      }
      setPaymentId(pid);

      // 3) 폴링 시작 (서버: /payments/{paymentId})
      await pollForeverUntilPaid(pid);
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
                key={c.payId ?? c.billingKey ?? idx}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 12px",
                  border: "1px solid " + (idx === selectedIdx ? "#4096ff" : "#ddd"),
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 8,
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
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
                      {c.brand || "등록된 카드"}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {c.bin
                        ? `${c.bin}-****-****-${c.last4 || "****"}`
                        : c.last4
                        ? `****-****-****-${c.last4}`
                        : ""}
                      {c.pg ? ` · ${c.pg}` : ""}
                      {c.payId ? ` · payId:${c.payId}` : ""}
                    </div>
                  </div>
                </div>

                {(!c.brand || !c.last4) && (
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    ※ 카드 상세정보는 첫 결제 완료 후 확인 가능합니다.
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleRegisterCard} disabled={busy} style={btnStyle}>
          {busy ? "처리 중…" : "카드 등록"}
        </button>
        <button
          onClick={handleStart}
          disabled={busy || !selectedCard}
          style={btnPrimaryStyle}
          title={
            selectedPayId
              ? `선택된 카드(payId=${selectedPayId})로 결제`
              : selectedCard?.billingKey
              ? "선택된 카드(빌링키)로 결제"
              : "카드를 선택하세요"
          }
        >
          {busy ? "처리 중…" : "구독 시작"}
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: 12, color: "#333" }}>
          {msg}
          {paymentId && (
            <div style={{ marginTop: 6, color: "#777", fontSize: 13 }}>
              상태: {uiStatus || "PENDING"} · paymentId: {paymentId}
            </div>
          )}
        </div>
      )}

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

function safeJ(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
