// src/pages/guide/MembershipPage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterMembershipPage() {
  return (
    <FooterLayout title="회원 혜택" subtitle="등급별 다양한 혜택을 받으세요.">
      <ul>
        <li>신규가입 쿠폰, 생일 쿠폰</li>
        <li>구독 회원 전용 추가 할인</li>
        <li>리뷰 작성 시 마일리지 지급</li>
      </ul>
    </FooterLayout>
  );
}
