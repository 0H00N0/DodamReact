// src/Plan/PlanCheckout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PortOne from "@portone/browser-sdk/v2";
import { billingKeysApi, paymentsApi, subscriptionApi } from "../utils/api";
import { requestBillingKeyV2 } from "./PlanPortone";

/**
 * 체크아웃 페이지
 * - 진입 시 /billing-keys/list 로드
 * - 카드가 없으면 "카드 등록" 버튼 → PortOne 위젯(v2)로 빌링키 발급 → /billing-keys 저장
 * - 카드가 있으면 "구독 시작 & 결제" 버튼 → /sub → /payments/confirm
 */
export default function CheckoutPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(search);
  const planCode = qs.get("code");
  const months = Number(qs.get("months") || "0");

  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // 등록된 카드 중 hasBillingKey=true 인 첫 항목
  const selected = useMemo(() => keys.find((k) => k.hasBillingKey), [keys]);

  // ===== PortOne v2 공개키 =====
  const storeId = "store-380bb70e-1b6d-44bf-a2b9-379844997520";
  const channelKey = "channel-key-2efd3630-abeb-4f65-828d-e85c2a82691e";

  // 고객 식별자(PortOne customer.id) — 프런트에서 안정적으로 유지되도록 로컬스토리지에 생성/보관
  const customerId = React.useMemo(() => {
    const k = "dodam_portone_customer_id";
    let v = localStorage.getItem(k);
    if (!v) {
      v = `cid_${Date.now()}`;
      localStorage.setItem(k, v);
    }
    return v;
  }, []);

  // 최초 로드: 결제수단 목록
  useEffect(() => {
    (async () => {
      try {
        if (!planCode || !months) {
          setMsg("잘못된 접근입니다. (planCode/months 누락)");
          return;
        }
        const { data } = await billingKeysApi.list(); // GET /billing-keys/list
        setKeys(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setMsg("결제수단 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [planCode, months]);

  // PortOne v2로 카드 등록(빌링키 발급) → 서버에 저장
  const onRegisterCard = async () => {
  try {
    setBusy(true);
    setMsg("카드 등록을 진행합니다...");

    const paymentId = `bk_${Date.now()}`;

    const res = await PortOne.requestPayment({
  storeId,
  channelKey,
  paymentId: `pay_${Date.now()}`,
  orderName: "장난감 구독 결제",
  totalAmount: 100,
  currency: "KRW",
  customer: { id: customerId },
  redirectUrl: `${window.location.origin}/checkout/result?code=${planCode}&months=${months}`, // 📌 수정
  payMethod: "CARD",
  method: { type: "CARD", paymentPlan: "BILLING" },
});


    if (res?.code) throw new Error(res.message || res.code);

    // 응답에서 빌링키/카드정보 추출(필드명 케이스 다양성 대비)
    const billingKey =
      res?.billingKey || res?.billing?.billingKey || res?.data?.billingKey;
    const cid   = res?.customer?.id || customerId;
    const brand = res?.card?.issuerName || res?.card?.issuer || "";
    const bin   = res?.card?.bin || "";
    const last4 =
      res?.card?.lastFourDigits ||
      res?.card?.number?.slice(-4) ||
      res?.card?.maskedNumber?.slice(-4) || "";

    if (!billingKey || !cid) throw new Error("빌링키를 받지 못했습니다.");

    await billingKeysApi.register({
      customerId: cid,
      billingKey,
      pg: "toss-payments",
      brand,
      bin,
      last4,
    });

    const { data } = await billingKeysApi.list();
    setKeys(Array.isArray(data) ? data : []);
    setMsg("카드 등록 완료");
  } catch (e) {
    console.error(e);
    setMsg(e?.message || "카드 등록 실패");
  } finally {
    setBusy(false);
  }
};

  // 구독 생성 → 결제 승인
  const onSubscribeAndPay = async () => {
    if (!selected) {
      alert("결제수단이 없습니다. 먼저 카드 등록을 해주세요.");
      return;
    }
    try {
      setBusy(true);
      setMsg("구독 생성 중...");

      // 백엔드 스펙에 맞게 요청 (예시)
      const subReq = { planCode, months, payId: selected.payId, mode: "AUTO" };
      const subRes = await subscriptionApi.start(subReq); // POST /sub

      const subId =
        subRes?.data?.subId ?? subRes?.data?.pmId ?? subRes?.data?.id;
      const invoiceId =
        subRes?.data?.invoiceId ??
        subRes?.data?.piId ??
        subRes?.data?.invoice?.piId;

      if (!invoiceId) throw new Error("생성된 인보이스 ID를 확인할 수 없습니다.");

      setMsg("결제 승인 중...");
      await paymentsApi.confirm({ invoiceId }); // POST /payments/confirm { invoiceId }

      setMsg("결제가 완료되었습니다. 감사합니다!");
      setTimeout(() => {
        if (subId) navigate(`/sub/${subId}/summary`);
        else navigate("/");
      }, 600);
    } catch (e) {
      console.error(e);
      setMsg(e?.message || "결제 처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>불러오는 중…</div>;

  return (
    <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 16px" }}>
      <h1>결제 진행</h1>
      <p>
        플랜: <b>{planCode}</b> / 기간: <b>{months}개월</b>
      </p>

      <section style={{ marginTop: 16 }}>
        <h3>내 결제수단</h3>
        {keys.length === 0 && <p>등록된 카드가 없습니다.</p>}
        {keys.map((k) => (
          <div
            key={k.payId}
            style={{
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <div>
              PG: {k.pg} / Brand: {k.brand}
            </div>
            <div>카드: {k.last4Masked || ""}</div>
            <div>빌링키: {k.hasBillingKey ? "등록됨" : "없음"}</div>
          </div>
        ))}
        {!selected && (
          <button onClick={onRegisterCard} disabled={busy} style={{ marginTop: 8 }}>
            {busy ? "등록 중…" : "카드 등록"}
          </button>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        <button onClick={onSubscribeAndPay} disabled={!selected || busy}>
          {busy ? "결제 중…" : "구독 시작 & 결제"}
        </button>
        <button onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>
          돌아가기
        </button>
      </section>

      {msg && <p style={{ marginTop: 12, color: "#555" }}>{msg}</p>}
    </div>
  );
}
