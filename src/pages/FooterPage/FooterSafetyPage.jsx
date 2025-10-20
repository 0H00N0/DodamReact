// src/pages/guide/SafetyPage.jsx
import React from "react";
import FooterLayout from "./FooterLayout";

export default function FooterSafetyPage() {
  return (
    <FooterLayout title="안전성 인증" subtitle="우리 아이를 위한 안전 기준">
      <p>도담도담은 KC 인증 및 관련 법규를 준수합니다.</p>
      <ul>
        <li>연령별 권장 사용 기준 준수</li>
        <li>무독성 소재 사용</li>
        <li>정기 점검 및 세척 프로세스 운영</li>
      </ul>
    </FooterLayout>
  );
}
