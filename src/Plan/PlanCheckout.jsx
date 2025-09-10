// src/Plan/PlanCheckout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PortOne from "@portone/browser-sdk/v2";
import { billingKeysApi, paymentsApi, subscriptionApi } from "../utils/api";

/**
 * 체크아웃 페이지
 * - 카드 없으면 PortOne v2로 빌링키 발급(redirect)
 * - redirect 복귀 시 txId/paymentId로 PG 조회 → 빌링키/카드정보 서버 저장 → 목록 리로드
 * - 카드 있으면 구독 생성 → invoiceId 기준 결제 승인(confirm)
 */
export default function CheckoutPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(search);

  const planCode = qs.get("code");
  const months = Number(qs.get("months") || "0");

  // ✅ 빠졌던 선언 추가
  const bkDone = qs.get("bk") === "1"; // 빌링키 redirect 복귀 플래그
  const txIdFromRedirect = qs.get("txId") || qs.get("transactionId"); // PortOne가 주는 txId
  const paymentIdFromRedirect = qs.get("paymentId"); // 있을 수도 있으니 보조로 유지

  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // 등록된 카드 중 hasBillingKey=true 인 첫 항목
  const selected = useMemo(() => keys.find((k) => k.hasBillingKey), [keys]);

  // ===== PortOne v2 공개키 =====
  const storeId = "store-380bb70e-1b6d-44bf-a2b9-379844997520";
  const channelKey = "channel-key-2efd3630-abeb-4f65-828d-e85c2a82691e";

  // 고객 식별자(PortOne customer.id) — 로컬에 고정 저장
  const customerId = React.useMemo(() => {
    const k = "dodam_portone_customer_id";
    let v = localStorage.getItem(k);
    if (!v) {
      v = `cid_${Date.now()}`;
      localStorage.setItem(k, v);
    }
    return v;
  }, []);

  // 최초 로드 + redirect 복귀 처리
  useEffect(() => {
    (async () => {
      try {
        if (!planCode || !months) {
          setMsg("잘못된 접근입니다. (planCode/months 누락)");
          return;
        }

        // 1) 빌링키 redirect 복귀: bk=1 && (txId || paymentId) 이면 PG 조회 → 서버 저장 → 리스트 리로드
        if (bkDone && (txIdFromRedirect || paymentIdFromRedirect)) {
          setBusy(true);
          setMsg("카드 등록 완료 처리 중...");

          // txId 우선, 없으면 paymentId로 조회
          let pay = null;
          try {
            if (txIdFromRedirect && paymentsApi.getTransaction) {
              const txRes = await paymentsApi.getTransaction(txIdFromRedirect);
              pay = txRes?.data;
            } else if (paymentIdFromRedirect) {
              const payRes = await paymentsApi.getPayment(paymentIdFromRedirect);
              pay = payRes?.data;
            }
          } catch (e) {
            console.error("PG 조회 실패:", e);
          }

          // PG 응답에서 빌링키/카드/고객 정보 추출(필드 케이스 다양성 대비)
          const billingKey =
            pay?.billingKey || pay?.billing?.billingKey || pay?.data?.billingKey;
          const cid = pay?.customer?.id || customerId;
          const brand = pay?.card?.issuerName || pay?.card?.issuer || "";
          const bin = pay?.card?.bin || "";
          const last4 =
            pay?.card?.lastFourDigits ||
            pay?.card?.number?.slice(-4) ||
            pay?.card?.maskedNumber?.slice(-4) ||
            "";

          if (billingKey && cid) {
            await billingKeysApi.register({
              customerId: cid,
              billingKey,
              pg: "toss-payments",
              brand,
              bin,
              last4,
            });
            setMsg("카드 등록이 완료되었습니다.");
          } else {
            setMsg("빌링키 정보를 확인할 수 없습니다.");
          }

          // 목록 재조회
          const { data } = await billingKeysApi.list();
          setKeys(Array.isArray(data) ? data : []);

          // URL 정리(새로고침 시 재처리 방지)
          const clean = `${window.location.origin}/checkout?code=${planCode}&months=${months}`;
          window.history.replaceState(null, "", clean);

          setBusy(false);
        } else {
          // 일반 진입: 목록 로드
          const { data } = await billingKeysApi.list();
          setKeys(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
        setMsg("결제수단 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  // ✅ 의존성 배열에 bkDone 포함
  }, [planCode, months, bkDone, txIdFromRedirect, paymentIdFromRedirect]);

  // PortOne v2로 카드 등록(빌링키 발급) — redirect 모드
  const onRegisterCard = async () => {
    try {
      setBusy(true);
      setMsg("카드 등록을 진행합니다...");

      const res = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: `pay_${Date.now()}`,
        orderName: "장난감 구독 결제",
        totalAmount: 1000, // 빌링키 발급용 소액(테스트값)
        currency: "KRW",
        customer: { id: customerId },
        // ✅ 빌링키는 결과 페이지가 아닌 체크아웃으로 복귀(bk=1 플래그 포함)
        redirectUrl: `${window.location.origin}/checkout?bk=1&code=${planCode}&months=${months}`,
        payMethod: "CARD",
        method: { type: "CARD", paymentPlan: "BILLING" },
      });

      // redirect 모드에서는 보통 여기서 끝. (에러만 잡아둠)
      if (res?.code) throw new Error(res.message || res.code);
    } catch (e) {
      console.error(e);
      setMsg(e?.message || "카드 등록 실패");
    } finally {
      setBusy(false);
    }
  };

  // 구독 생성 → 결제 승인(confirm)
  const onSubscribeAndPay = async () => {
    if (!selected) {
      alert("결제수단이 없습니다. 먼저 카드 등록을 해주세요.");
      return;
    }
    try {
      setBusy(true);
      setMsg("구독 생성 중...");

      const payload = {
        planCode,
        months,
        payId: selected.payId,
        mode: "AUTO",
      };

      // POST /sub → invoiceId 반환(반드시 세션 저장)
      const subRes = await subscriptionApi.start(payload);

      const subId =
        subRes?.data?.subId ?? subRes?.data?.pmId ?? subRes?.data?.id;
      const invoiceId =
        subRes?.data?.invoiceId ??
        subRes?.data?.piId ??
        subRes?.data?.invoice?.piId;

      if (!invoiceId) throw new Error("생성된 인보이스 ID를 확인할 수 없습니다.");

      sessionStorage.setItem("plan_invoice_id", String(invoiceId));

      setMsg("결제 승인 중...");
      await paymentsApi.confirm({ invoiceId }); // 서버가 DB에서 paymentId/amount 찾아 confirm

      setMsg("결제가 완료되었습니다. 감사합니다!");
      setTimeout(() => {
        if (subId) navigate(`/sub/${subId}/summary`);
        else navigate("/sub/me");
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

      {/* 빌링키 복귀 안내 */}
      {bkDone && (
        <p style={{ marginTop: 8, color: "#2a7" }}>
          카드 등록 복귀 중입니다. 잠시만 기다려주세요…
        </p>
      )}

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
            <div>PG: {k.pg} / Brand: {k.brand}</div>
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
