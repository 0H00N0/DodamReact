// src/Plan/PlanCheckout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PortOne from "@portone/browser-sdk/v2";
import { billingKeysApi, paymentsApi, subscriptionApi } from "../utils/api";

export default function CheckoutPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(search);

  const planCode = qs.get("code");
  const months = Number(qs.get("months") || 1);

  const [cards, setCards] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | redirectHandling

  // redirect params
  const billingKeyFromRedirect = qs.get("billingKey"); // 일부 PG는 제공
  const txId = qs.get("txId");                         // 일부 PG는 txId만
  const paymentId = qs.get("paymentId");               // 또는 paymentId만

  const hasCard = useMemo(() => Array.isArray(cards) && cards.length > 0, [cards]);

  const clearRedirectParams = () => {
    const url = new URL(window.location.href);
    url.search = `?code=${encodeURIComponent(planCode)}&months=${months}`;
    window.history.replaceState({}, "", url.toString());
  };

  const loadCards = async () => {
    try {
      const res = await billingKeysApi.list();
      const items = Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : []);
      setCards(items);
    } catch (e) {
      console.error("LOAD CARDS FAIL:", e);
      setCards([]);
    }
  };

  // 초기 로드 + 리다이렉트 복귀 처리
  // 초기 로드 + 리다이렉트 복귀 처리
useEffect(() => {
  (async () => {
    await loadCards();

    const hasReturnEvidence =
      (billingKeyFromRedirect && billingKeyFromRedirect.trim().length > 0) ||
      (txId && txId.trim()) ||
      (paymentId && paymentId.trim());

    if (!hasReturnEvidence) return;                // ← 바로 탈출

    setPhase("redirectHandling");
    setBusy(true);
    setMsg("카드 등록 처리 중...");
    let didRegister = false;

    try {
      if (billingKeyFromRedirect && billingKeyFromRedirect.trim().length > 0) {
        await billingKeysApi.register({
          billingKey: billingKeyFromRedirect,
          pg: "TOSSPAYMENTS",
          brand: "",
          bin: "",
          last4: "",
          raw: ""
        });
        didRegister = true;
      } else if ((txId && txId.trim()) || (paymentId && paymentId.trim())) {
        const lookupRes = await paymentsApi.lookup({ txId, paymentId });
        const data = lookupRes?.data || lookupRes;
        if (data?.status === "success" && data?.billingKey) {
          await billingKeysApi.register({
            billingKey: data.billingKey,
            pg: data.pg || "TOSSPAYMENTS",
            brand: data.issuerName || data.brand || "",
            bin: data.bin || "",
            last4: data.last4 || "",
            raw: JSON.stringify(data)
          });
          didRegister = true;
        } else {
          throw new Error("PG 조회 실패: " + (data?.status || "unknown"));
        }
      }

      if (didRegister) {
        setMsg("카드 등록이 완료되었습니다.");
      } else {
        setMsg("복귀 정보가 없습니다. 다시 시도해 주세요.");
        return;                                     // ← 성공 메시지로 덮이는 것 방지
      }
    } catch (e) {
      console.error("REGISTER FAIL:", e?.response?.status, e?.response?.data || e);
      const em =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "UNKNOWN";
      setMsg("결제수단 등록 실패: " + em);
    } finally {
      clearRedirectParams();
      await loadCards();
      setBusy(false);
      setPhase("idle");
    }
  })();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // 결제수단 등록 시작 (PortOne 빌링키 발급: 리다이렉트 방식만 사용)
  const handleRegisterCard = async () => {
  try {
    setBusy(true);
    setMsg("결제수단 등록 창을 여는 중...");

    // 1) customerId 확보
    const cidRes = await billingKeysApi.customerId();
    const customerId = cidRes?.customerId || cidRes?.data?.customerId;
    if (!customerId) {
      setBusy(false);
      setMsg("로그인이 필요합니다.");
      return;
    }

    // 2) .env 키 확인
    const storeId = process.env.REACT_APP_PORTONE_STORE_ID;
    const channelKey = process.env.REACT_APP_PORTONE_CHANNEL_KEY;
    if (!storeId || !channelKey) {
      console.error("PortOne 키 없음", { storeId, channelKey });
      setBusy(false);
      setMsg(".env의 REACT_APP_PORTONE_STORE_ID / CHANNEL_KEY를 확인하세요.");
      return;
    }

    // 3) 포트원 호출 (모달/팝업 ↔ 리다이렉트 모두 대응)
    const result = await PortOne.requestIssueBillingKey({
      storeId,
      channelKey,
      pgProvider: "TOSSPAYMENTS",
      billingKeyMethod: "CARD",
      customer: { id: customerId },
      redirectUrl: `${window.location.origin}/checkout?code=${encodeURIComponent(planCode)}&months=${months}`,
    });

    // 👇 여기까지 왔다는 건 ‘모달/팝업’ 경로일 확률이 높음 (리다이렉트면 보통 실행되지 않음)
    setBusy(false);

    // 4) 사용자 취소/실패
    if (!result) {
      setMsg("카드 등록이 취소되었습니다.");
      return;
    }
    if (result.code) {
      // 포트원 SDK 표준 에러 포맷: { code, message }
      setMsg(`결제수단 등록 실패: ${result.message || result.code}`);
      return;
    }

    // 5) 성공 경로: billingKey 직접 반환
    if (result.billingKey && String(result.billingKey).trim().length > 0) {
      setBusy(true);
      setMsg("카드 등록 처리 중...");

      await billingKeysApi.register({
        billingKey: result.billingKey,
        pg: "TOSSPAYMENTS",
        brand: result.issuerName || result.brand || "",
        bin: result.bin || "",
        last4: result.last4 || "",
        raw: JSON.stringify(result),
      });

      await loadCards();
      setBusy(false);
      setMsg("카드 등록이 완료되었습니다.");
      return;
    }

    // 6) 성공 경로: txId/paymentId만 반환 → 서버 조회 후 등록
    if (result.txId || result.paymentId) {
      setBusy(true);
      setMsg("카드 등록 처리 중...");

      const lookup = await paymentsApi.lookup({
        txId: result.txId,
        paymentId: result.paymentId,
      });
      const data = lookup?.data || lookup;

      if (data?.billingKey) {
        await billingKeysApi.register({
          billingKey: data.billingKey,
          pg: data.pg || "TOSSPAYMENTS",
          brand: data.issuerName || data.brand || "",
          bin: data.bin || "",
          last4: data.last4 || "",
          raw: JSON.stringify(data),
        });
        await loadCards();
        setMsg("카드 등록이 완료되었습니다.");
      } else {
        setMsg("PG 조회 실패: billingKey 없음");
      }

      setBusy(false);
      return;
    }

    // 7) 여기까지 오면 알 수 없는 케이스
    setMsg("카드 등록 창이 닫혔지만 결과를 받지 못했습니다.");
  } catch (e) {
    console.error("ISSUE_BILLING_KEY FAIL:", e);
    setMsg("결제수단 등록 시작 실패");
    setBusy(false);
  }
};


  // 카드가 있으면 구독 생성/결제 승인
  const handleSubscribe = async () => {
    if (!hasCard) {
      setMsg("먼저 결제수단을 등록해주세요.");
      return;
    }
    try {
      setBusy(true);
      setMsg("구독 생성 중...");

      const subRes = await subscriptionApi.create({ planCode, months });
      const invoiceId = subRes?.invoiceId || subRes?.data?.invoiceId;
      if (!invoiceId) throw new Error("invoiceId not returned");

      setMsg("결제 승인 중...");
      await paymentsApi.confirm({ invoiceId });

      setMsg("구독이 시작되었습니다.");
      navigate(`/plans/${planCode}?sub=ok`);
    } catch (e) {
      console.error("SUBSCRIBE FAIL:", e?.response || e);
      const em =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "UNKNOWN";
      setMsg("구독 처리 실패: " + em);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>체크아웃</h2>
      <p>플랜: {String(planCode)} / 기간: {months}개월</p>

      <div style={{ margin: "12px 0" }}>
        <button onClick={handleRegisterCard} disabled={busy || phase !== "idle"}>
          결제수단 등록/변경
        </button>
      </div>

      <div style={{ margin: "12px 0" }}>
        <button onClick={handleSubscribe} disabled={busy || !hasCard}>
          구독 시작
        </button>
      </div>

      {busy && <p>처리중...</p>}
      {msg && <p>{msg}</p>}

      <hr />
      <h3>내 결제수단</h3>
      {cards.length === 0 ? (
        <p>등록된 결제수단이 없습니다.</p>
      ) : (
        <ul>
          {cards.map((c) => (
            <li key={c.payId}>
              {(c.payBrand || "").toUpperCase()} • **** **** **** {(c.payLast4 || "????")} (customer: {c.payCustomer})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
