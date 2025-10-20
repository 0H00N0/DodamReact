// src/pages/guide/OrderGuidePage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterOrderGuidePage() {
  return (
    <FooterLayout title="주문 방법" subtitle="간편하게 주문해 보세요.">
      <ol>
        <li>상품 검색 &gt; 옵션 선택 &gt; 장바구니 담기</li>
        <li>주문서 작성 &gt; 결제 수단 선택</li>
        <li>결제 완료 &gt; 마이페이지에서 진행상태 확인</li>
      </ol>
    </FooterLayout>
  );
}
