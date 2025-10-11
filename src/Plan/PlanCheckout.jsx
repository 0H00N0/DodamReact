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

  const norm = (v) => String(v || "").trim().toUpperCase();
  const isSuccess = (s) =>
    ["PAID", "SUCCEEDED", "SUCCESS", "PARTIAL_PAID"].includes(norm(s));

  // =========================
  // 폴링 관련
  // =========================
  const alive = useRef(true);
  const elapsedSec = useRef(0);
  const elapsedTick = useRef(null);
  const pollTimer = useRef(null);
  const startedAt = useRef(null);
  const [uiStatus, setUiStatus] = useState(null);
  const [handleId, setHandleId] = useState(null);
  const [shownPaymentId, setShownPaymentId] = useState(null);

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

  const pollOnce = async (handle) => {
    try {
      const r = await paymentsApi.lookup(handle);
      const s = norm(r?.data?.status || r?.data?.result);
      const done = Boolean(r?.data?.done);
      setUiStatus(s || "UNKNOWN");
      const pid = r?.data?.paymentId;
      if (pid) setShownPaymentId(pid);

      if (done) {
        stopElapsed();
        const invId = r?.data?.invoiceId ?? "";
        if (isSuccess(s)) {
          setMsg("결제 완료되었습니다.");
        } else {
          setMsg("결제가 완료되지 않았습니다.");
        }
        navigate(
          `/plan/checkout/result?invoiceId=${invId}&paymentId=${pid || handle}&status=${s}`
        );
        return true;
      }
      setDebug((d) => d + `\n[POLL] handle=${handle} status=${s}`);
      return false;
    } catch (e) {
      setDebug((d) => d + `\n[POLL ERROR] ${e?.message || e}`);
      return false;
    }
  };

  const pollForeverUntilPaid = async (handle) => {
    startElapsed();
    setMsg("결제 진행중… (경과 0초)");
    setUiStatus("PENDING");

    const loop = async () => {
      if (!alive.current) return;
      const done = await pollOnce(handle);
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
      const callDesc = hasIssueFn
        ? "requestIssueBillingKey"
        : "requestPayment(BILLING)";
      setDebug((d) => d + `\n[SDK] Using ${callDesc}`);

      let resp;
      if (hasIssueFn) {
        resp = await PortOne.requestIssueBillingKey({
          storeId,
          channelKey,
          redirectUrl,
          billingKeyMethod,
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

      setMsg("카드 등록이 취소되었거나 실패했습니다.");
      setDebug(
        (d) =>
          d + `\n[FAIL PATH] statusLike=${statusLike} billingKey=${resp?.billingKey}`
      );
    } catch (e) {
      setMsg("카드 등록 실패 (네트워크/서버).");
      setDebug((d) => d + `\n[ERROR] ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  // =========================
  // ✅ 카드 삭제 (비활성화) — payId 우선, 없으면 billingKey
  // =========================
  async function handleDeleteCard(card) {
    if (!card || busy) return;
    if (!window.confirm("해당 카드를 삭제(비활성화)하시겠습니까?")) return;
    setBusy(true);
    try {
      if (card.payId) {
        await billingKeysApi.deleteById(card.payId);
      } else if (card.billingKey) {
        await billingKeysApi.deleteByKey(card.billingKey);
      } else {
        throw new Error("삭제 식별자가 없습니다.");
      }
      setMsg("카드가 삭제되었습니다.");
      await loadCards();
    } catch (e) {
      setMsg("카드 삭제 실패");
      setDebug((d) => d + `\n[DELETE ERROR] ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  // =========================
  // 결제 시작
  // =========================
  async function handleStart() {
    if (busy || !selectedCard) return;
    setBusy(true);
    setDebug("");
    setMsg("인보이스 생성 중…");
    try {
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

      setMsg(`인보이스 생성 완료 (ID: ${invoiceId}). 결제를 시작합니다…`);
      const payRes = await paymentsApi.confirm({ invoiceId });

      const pid =
        payRes?.data?.paymentId || payRes?.data?.id || payRes?.data?.payment_id;
      const oid = payRes?.data?.orderId;
      if (!pid && !oid) {
        setMsg("결제 시작 실패: 식별자(handle) 없음");
        setDebug((d) => d + `\n[CONFIRM RESP] ${safeJ(payRes?.data)}`);
        return;
      }

      const handle = pid ?? oid;
      setHandleId(handle);
      if (pid) setShownPaymentId(pid);
      await pollForeverUntilPaid(handle);
    } catch (e) {
      setMsg("결제에 실패했습니다. 다시 시도해 주세요.");
      setDebug((d) => d + `\n[CHECKOUT ERROR] ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  // =========================
  // 렌더링
  // =========================
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
                  flexDirection: "column",
                  gap: 6,
                  padding: "10px 12px",
                  border:
                    "1px solid " + (idx === selectedIdx ? "#4096ff" : "#ddd"),
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                    </div>
                  </div>
                  {/* 🔽 카드 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(c);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#d00",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>
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
        <button
          onClick={handleStart}
          disabled={busy || !selectedCard}
          style={btnPrimaryStyle}
        >
          {busy ? "처리 중…" : "구독 시작"}
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: 12, color: "#333" }}>
          {msg}
          {(handleId || shownPaymentId) && (
            <div style={{ marginTop: 6, color: "#777", fontSize: 13 }}>
              상태: {uiStatus || "PENDING"} · handle: {handleId || "-"}
              {shownPaymentId ? ` · paymentId: ${shownPaymentId}` : ""}
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
