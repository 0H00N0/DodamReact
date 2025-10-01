// src/pages/customer/AsPage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterAsPage() {
  return (
    <FooterLayout title="A/S 안내" subtitle="제품 이상 시 무상/유상 기준에 따라 처리됩니다.">
      <h3>무상 A/S</h3>
      <p>구매 후 7일 이내 초기 불량으로 확인될 경우 교환 또는 환불</p>
      <h3>유상 A/S</h3>
      <p>사용 중 파손/훼손은 유상 처리됩니다.</p>
      <p style={{ marginTop: 12 }}>A/S 접수: 1588-1234 / as@dodamtoyland.co.kr</p>
    </FooterLayout>
  );
}
