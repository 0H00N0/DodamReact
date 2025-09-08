// src/Plan/PlanPortone.js
import PortOne from "@portone/browser-sdk/v2";

/**
 * 문자열 세이프처리
 */
const s = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

/**
 * PortOne v2 빌링키 발급 (카드 인증 창)
 * @param {object} params
 * @param {string} params.storeId     - PortOne v2 Store ID (예: store-xxxx)
 * @param {string} params.channelKey  - PortOne v2 채널키 (테스트/운영)
 * @param {string} params.customerId  - 우리 쪽 고객 식별자(세션 sid 등, 문자열)
 * @returns {Promise<{customerId, billingKey, pg, brand, bin, last4}>}
 */
export async function requestBillingKeyV2({ storeId, channelKey, customerId }) {
  // 멱등/추적용 결제 ID
  const paymentId = `bk_${Date.now()}`;

  const res = await PortOne.requestPayment({
    // v2 공통
    storeId,
    channelKey,
    paymentId,
    orderName: "카드 등록(빌링키 발급)",
    totalAmount: 100,              // ⛔️ 0원 불가 → 소액 승인
    currency: "KRW",
    customer: { id: customerId },

    // v1 호환 필드(일부 에러 방지용)
    payMethod: "CARD",

    // v2 결제수단 + 정기결제(빌링) 모드
    method: {
      type: "CARD",
      paymentPlan: "BILLING",
    },

    // 모바일 사파리 대비(선택)
    redirectUrl: window.location.href,
  });

  // 에러 형태(코드 기반) 방어
  if (res?.code) throw new Error(res.message || res.code);

  // 계정/PG별 응답 키 방어적으로 추출
  const billingKey =
    res?.billing?.billingKey ||
    res?.billingKey;

  const brand =
    res?.card?.issuerName || res?.card?.issuer || "";

  const bin = res?.card?.bin || "";

  const last4 =
    res?.card?.lastFourDigits ||
    (res?.card?.number && res.card.number.slice(-4)) ||
    (res?.card?.maskedNumber && res.card.maskedNumber.slice(-4)) ||
    "";

  if (!billingKey) throw new Error("빌링키를 받지 못했습니다.");

  return {
    customerId,
    billingKey,
    pg: "toss-payments",
    brand,
    bin,
    last4,
  };
}