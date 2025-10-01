// src/pages/customer/ReturnPage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterReturnPage() {
  return (
    <FooterLayout title="교환·반품 안내" subtitle="상품 수령 후 7일 이내 신청 가능합니다.">
      <h3>신청 방법</h3>
      <ol>
        <li>마이페이지 &gt; 주문내역에서 교환/반품 신청</li>
        <li>상담원 안내에 따라 회수 접수</li>
        <li>상품 회수 확인 후 환불/재발송 처리</li>
      </ol>
      <h3>유의사항</h3>
      <ul>
        <li>사용 흔적, 구성품 누락, 포장 훼손 시 처리 불가할 수 있습니다.</li>
        <li>단순 변심의 경우 왕복 배송비가 부과됩니다.</li>
      </ul>
    </FooterLayout>
  );
}
