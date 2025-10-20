// src/pages/guide/PaymentGuidePage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterPaymentGuidePage() {
  return (
    <FooterLayout title="결제 안내" subtitle="안전한 결제 시스템을 제공합니다.">
      <ul>
        <li>지원 수단: 신용/체크카드, 간편결제(토스 등), 무통장입금</li>
        <li>정기결제: 포트원 v2 기반 자동결제 지원</li>
        <li>현금영수증/세금계산서 발급 가능</li>
      </ul>
    </FooterLayout>
  );
}
