// src/Plan/PlanPortone.js
import PortOne from "@portone/browser-sdk/v2";

const REDIRECT_URL = `${window.location.origin}/#/billing-keys/redirect`;

const s = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

export async function requestBillingKeyV2({ storeId, channelKey, customerId }) {
  const paymentId = `bk_${Date.now()}`;

  const res = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId,
    orderName: "카드 등록(빌링키 발급)",
    totalAmount: 100,
    currency: "KRW",
    customer: { id: customerId },
    payMethod: "CARD",
    method: { type: "CARD", paymentPlan: "BILLING" },
    redirectUrl: REDIRECT_URL, // 리다이렉트 시에는 billingIssueToken만 전달됨
  });

  // 오버레이(Promise) 경로: billingKey를 바로 받는 경우 (URL 사용 X, POST 바디로만 전달)
  if (res?.billingKey) {
    const brand =
      res?.card?.brand || res?.card?.issuerName || "";
    const bin = res?.card?.bin || "";
    const last4 =
      res?.card?.lastFourDigits ||
      (res?.card?.number && res.card.number.slice(-4)) ||
      (res?.card?.maskedNumber && res.card.maskedNumber.slice(-4)) ||
      "";

    return {
      customerId,
      billingKey: res.billingKey, // ← 이 값은 호출측에서 서버에 POST 바디로 전달 (REST)
      pg: "toss-payments",
      brand,
      bin,
      last4,
    };
  }

  // 리다이렉트 경로: Redirect.jsx에서 billingIssueToken만 처리
  if (
    res?.transactionType === "ISSUE_BILLING_KEY" &&
    res?.status === "NEEDS_CONFIRMATION" &&
    res?.billingIssueToken
  ) {
    const url = new URL(REDIRECT_URL);
    url.searchParams.set("transactionType", "ISSUE_BILLING_KEY");
    url.searchParams.set("status", "NEEDS_CONFIRMATION");
    url.searchParams.set("billingIssueToken", res.billingIssueToken);
    window.location.assign(url.toString());
    return;
  }

  if (res?.code) throw new Error(res.message || res.code);
  throw new Error("빌링키 발급 결과를 확인할 수 없습니다.");
}
