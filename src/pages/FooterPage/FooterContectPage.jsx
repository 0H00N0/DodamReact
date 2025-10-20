// src/pages/customer/ContactPage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterContactPage() {
  return (
    <FooterLayout title="1:1 문의" subtitle="궁금한 내용을 남겨 주세요. 빠르게 답변드릴게요.">
      <ul>
        <li>운영시간: 평일 10:00 ~ 17:00 (점심 12:30 ~ 13:30)</li>
        <li>전화: 1588-1234 / 이메일: support@dodamtoyland.co.kr</li>
      </ul>
      <p style={{ marginTop: 16 }}>
        마이페이지 &gt; 1:1 문의에서 접수하시면 처리 현황을 확인하실 수 있습니다.
      </p>
    </FooterLayout>
  );
}
