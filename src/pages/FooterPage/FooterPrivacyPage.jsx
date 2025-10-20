// src/pages/policy/PrivacyPage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterPrivacyPage() {
  return (
    <FooterLayout title="개인정보처리방침" subtitle="고객님의 정보를 안전하게 보호합니다.">
      <p>※ 방침 전문을 입력해 주세요.</p>
      <h3>수집 항목 및 이용 목적</h3>
      <ul>
        <li>회원 가입 및 고객 상담</li>
        <li>주문/결제 및 배송</li>
      </ul>
    </FooterLayout>
  );
}
