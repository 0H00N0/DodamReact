// src/pages/customer/ShippingPage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterShippingPage() {
  return (
    <FooterLayout title="배송 안내" subtitle="안전하고 빠른 배송으로 찾아갑니다.">
      <h3>배송기간</h3>
      <p>결제 완료 후 평균 2~3일 이내 출고됩니다. (주말/공휴일 제외)</p>
      <h3>배송비</h3>
      <p>3만원 이상 무료, 미만 주문은 3,000원 (도서산간 추가비용 발생 가능)</p>
      <h3>포장</h3>
      <p>유아 안전 포장재를 사용하며 완충재를 충분히 넣어 파손을 최소화합니다.</p>
    </FooterLayout>
  );
}
