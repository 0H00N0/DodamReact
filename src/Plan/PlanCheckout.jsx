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

  // === 반응형: 모바일 감지 (<= 640px)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(max-width: 640px)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 640px)");
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener?.("change", handler);
    // Safari 등 구형 브라우저 대응
    mql.addListener?.(handler);
    return () => {
      mql.removeEventListener?.("change", handler);
      mql.removeListener?.(handler);
    };
  }, []);

  const selectedCard = useMemo(
    () => (cards && cards.length > 0 ? cards[selectedIdx] : null),
    [cards, selectedIdx]
  );
  const selectedPayId = selectedCard?.payId ?? selectedCard?.id ?? null;

  // ===== 폴링 관련(표시 UI 없음)
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

  const norm = (v) => String(v || "").trim().toUpperCase();
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
        navigate(
          `/plan/checkout/result?invoiceId=${invId}&paymentId=${pid || handle}&status=${s}`
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const pollForeverUntilPaid = async (handle) => {
    startElapsed();
    setUiStatus("PENDING");
    const loop = async () => {
      if (!alive.current) return;
      const done = await pollOnce(handle);
      if (done) return;
      pollTimer.current = setTimeout(loop, backoffMs());
    };
    loop();
  };

  // ===== 카드(빌링키) 목록
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
    } catch {}
  }

  useEffect(() => {
    loadCards();
    try {
      sessionStorage.setItem("lastCheckoutUrl", window.location.href);
      sessionStorage.setItem("lastCheckoutQuery", window.location.search || "");
    } catch {}
  }, []);

  // ===== 카드 등록
  async function handleRegisterCard() {
    if (busy) return;
    setBusy(true);
    try {
      const storeId = process.env.REACT_APP_PORTONE_STORE_ID;
      const channelKey = process.env.REACT_APP_PORTONE_CHANNEL_KEY;
      const billingKeyMethod = process.env.REACT_APP_BILLING_METHOD || "CARD";
      if (!storeId) return;

      const redirectUrl = `${window.location.origin}/#/billing-keys/redirect`;
      try {
        sessionStorage.setItem("lastCheckoutUrl", window.location.href);
        sessionStorage.setItem("lastCheckoutQuery", window.location.search || "");
      } catch {}

      let resp;
      if (typeof PortOne?.requestIssueBillingKey === "function") {
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
        await loadCards();
        return;
      }
      if (statusLike === "NEEDS_CONFIRMATION" && resp?.billingIssueToken) {
        const url = new URL(redirectUrl);
        url.searchParams.set("transactionType", "ISSUE_BILLING_KEY");
        url.searchParams.set("status", "NEEDS_CONFIRMATION");
        url.searchParams.set("billingIssueToken", resp.billingIssueToken);
        window.location.assign(url.toString());
        return;
      }
    } catch {} finally {
      setBusy(false);
    }
  }

  // ===== 카드 삭제
  async function handleDeleteCard(card) {
    if (!card || busy) return;
    if (!window.confirm("해당 카드를 삭제하시겠습니까?")) return;
    setBusy(true);
    try {
      if (card.payId) await billingKeysApi.deleteById(card.payId);
      else if (card.billingKey) await billingKeysApi.deleteByKey(card.billingKey);
      await loadCards();
    } catch {} finally {
      setBusy(false);
    }
  }

  // ===== 결제 시작
  async function handleStart() {
    if (busy || !selectedCard) return;
    setBusy(true);
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
      if (!invoiceId) return;

      const payRes = await paymentsApi.confirm({ invoiceId });
      const pid =
        payRes?.data?.paymentId || payRes?.data?.id || payRes?.data?.payment_id;
      const oid = payRes?.data?.orderId;
      if (!pid && !oid) return;

      const handle = pid ?? oid;
      setHandleId(handle);
      if (pid) setShownPaymentId(pid);
      await pollForeverUntilPaid(handle);
    } catch {} finally {
      setBusy(false);
    }
  }

  // ===== 파스텔 연핑크 테마 (연하고 꽉 차는 레이아웃)
  const theme = {
    bg: "#FFFAFC",
    panel: "#FFFFFF",
    panelAlt: "#FFF4F8",
    border: "#FFE3EE",
    borderStrong: "#FFD1E5",
    divider: "#FFE8F1",
    text: "#6F5663",
    textSub: "#9A8190",
    accent: "#FFC8DB",
    accentDeep: "#FFB3D0",
    accentSoft: "#FFF6FA",
    shadow: "0 10px 24px rgba(255, 175, 205, 0.15)",
    radius: 18,
  };

  const styles = {
    page: {
      background: `linear-gradient(180deg, ${theme.bg} 0%, #FFFFFF 100%)`,
      padding: "24px 16px 40px",
    },
    wrap: {
      maxWidth: 880,
      margin: "0 auto",
    },
    headerCard: {
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: theme.radius,
      boxShadow: theme.shadow,
      padding: "22px 24px",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
      alignItems: "center",
      gap: 16,
      marginBottom: 18,
    },
    title: {
      fontSize: isMobile ? 22 : 26,
      fontWeight: 900,
      color: theme.text,
      letterSpacing: 0.2,
      lineHeight: 1.25,
      margin: 0,
    },
    summary: {
      fontSize: 14,
      color: theme.textSub,
      marginTop: 6,
    },
    summaryBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 999,
      background: theme.accentSoft,
      border: `1px solid ${theme.borderStrong}`,
      color: theme.text,
      fontWeight: 700,
      fontSize: 12,
      marginLeft: 8,
    },
    sectionCard: {
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: theme.radius,
      boxShadow: theme.shadow,
      padding: isMobile ? 14 : 18,
      marginBottom: 18,
    },
    sectionH: {
      fontSize: 16,
      fontWeight: 800,
      color: theme.text,
      margin: "2px 2px 12px",
    },
    empty: {
      padding: 16,
      borderRadius: 14,
      background: theme.accentSoft,
      border: `1.5px dashed ${theme.borderStrong}`,
      color: theme.textSub,
      textAlign: "center",
    },
    // ★ 카드 목록: 모바일 1열, 데스크톱 2열
    cardList: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 12,
    },
    cardItem: (active) => ({
      padding: isMobile ? "12px 12px" : "14px 14px",
      borderRadius: 14,
      border: `1.5px solid ${active ? theme.accentDeep : theme.border}`,
      background: active ? theme.panelAlt : theme.panel,
      boxShadow: active ? "0 6px 16px rgba(255, 180, 205, 0.12)" : "none",
      transition: "transform .08s ease, box-shadow .2s ease, background .2s ease",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }),
    radio: (active) => ({
      width: 18,
      height: 18,
      borderRadius: 999,
      border: `2px solid ${active ? theme.accentDeep : theme.borderStrong}`,
      background: active ? theme.accentDeep : "#fff",
      boxShadow: active ? "0 0 0 6px rgba(255, 179, 208, 0.15)" : "none",
      flex: "0 0 auto",
    }),
    cardMetaWrap: { flex: 1, minWidth: 0 },
    cardBrand: { fontWeight: 800, color: theme.text, fontSize: isMobile ? 14 : 15 },
    cardMeta: { fontSize: 12, color: theme.textSub, marginTop: 2 },
    delBtn: {
      background: "#fff",
      border: `1px solid ${theme.borderStrong}`,
      color: theme.text,
      padding: "8px 10px",
      borderRadius: 999,
      fontSize: 12,
      flex: "0 0 auto",
    },
    divider: {
      height: 1,
      background: theme.divider,
      margin: "14px 0 0",
    },
    metaRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      color: theme.textSub,
      fontSize: 13,
      marginTop: 6,
    },
    // ★ 액션바: 모바일 세로 스택, 데스크톱 2열
    actionBar: {
      marginTop: 18,
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr",
      gap: 10,
    },
    btn: {
      padding: isMobile ? "14px 16px" : "16px 18px",
      borderRadius: 999,
      border: `1px solid ${theme.borderStrong}`,
      background: "#fff",
      color: theme.text,
      fontWeight: 800,
      letterSpacing: 0.2,
      fontSize: isMobile ? 15 : 16,
      boxShadow: "0 3px 0 rgba(0,0,0,0.03)",
      transition: "transform .06s ease, box-shadow .2s ease",
      width: "100%",
    },
    btnPrimary: {
      padding: isMobile ? "14px 18px" : "16px 20px",
      borderRadius: 999,
      border: "none",
      background: `linear-gradient(180deg, ${theme.accent}, ${theme.accentDeep})`,
      color: "#fff",
      fontWeight: 900,
      letterSpacing: 0.3,
      fontSize: isMobile ? 16 : 17,
      boxShadow: "0 10px 20px rgba(255, 160, 200, 0.25)",
      transition: "transform .06s ease, box-shadow .2s ease",
      width: "100%",
    },
    btnDisabled: {
      opacity: 0.6,
      pointerEvents: "none",
    },
  };

  const onHover = (e) => (e.currentTarget.style.transform = "translateY(-1px)");
  const onLeave = (e) => (e.currentTarget.style.transform = "translateY(0)");
  const onPress = (e) => (e.currentTarget.style.transform = "translateY(1px)");

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.headerCard}>
          <div>
            <h1 style={styles.title}>구독 결제</h1>
            <div style={styles.summary}>
              선택한 플랜 <b>{planCode || "-"}</b>
              <span style={styles.summaryBadge}>{months}개월</span>
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionH}>결제수단</div>

          {cards.length === 0 ? (
            <div style={styles.empty}>
              등록된 카드가 없습니다. 아래에서 먼저 등록해 주세요.
            </div>
          ) : (
            <div style={styles.cardList}>
              {cards.map((c, idx) => {
                const active = idx === selectedIdx;
                return (
                  <div
                    key={c.payId ?? c.billingKey ?? idx}
                    onClick={() => setSelectedIdx(idx)}
                    style={styles.cardItem(active)}
                    onMouseEnter={onHover}
                    onMouseLeave={onLeave}
                  >
                    <div style={styles.radio(active)} />
                    <div style={styles.cardMetaWrap}>
                      <div style={styles.cardBrand}>{c.brand || "등록된 카드"}</div>
                      <div style={styles.cardMeta}>
                        {c.bin
                          ? `${c.bin}-****-****-${c.last4 || "****"}`
                          : c.last4
                          ? `****-****-****-${c.last4}`
                          : ""}
                        {c.pg ? ` · ${c.pg}` : ""}
                      </div>
                    </div>
                    <button
                      style={styles.delBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(c);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div style={styles.divider} />
          <div style={styles.metaRow}>
            <span>선택된 결제수단</span>
            <b>
              {selectedCard
                ? `${selectedCard.brand || "카드"}${
                    selectedCard.last4 ? ` ···· ${selectedCard.last4}` : ""
                  }`
                : "없음"}
            </b>
          </div>
        </div>

        <div style={styles.actionBar}>
          <button
            onClick={handleRegisterCard}
            disabled={busy}
            style={{ ...styles.btn, ...(busy ? styles.btnDisabled : {}) }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onMouseDown={onPress}
            onMouseUp={onHover}
          >
            카드 등록
          </button>

          <button
            onClick={handleStart}
            disabled={busy || !selectedCard}
            style={{
              ...styles.btnPrimary,
              ...((busy || !selectedCard) ? styles.btnDisabled : {}),
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onMouseDown={onPress}
            onMouseUp={onHover}
          >
            구독 시작
          </button>
        </div>
      </div>
    </div>
  );
}
