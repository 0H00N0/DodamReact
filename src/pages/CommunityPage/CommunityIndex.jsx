// src/pages/CommunityPage/CommunityIndex.jsx
import React from "react";
import "./CommunityPink.css";
import CommunityModalProvider from "./CommunityModalProvider";
import CommunityLayout from "./CommunityLayout";

/**
 * 커뮤니티 루트: 전역 핑크 테마 + 모달 Provider 적용
 * 실제 화면 배치는 CommunityLayout에서만 렌더링(중복 방지)
 */
export default function CommunityIndex() {
  return (
    <div className="pinkTheme">
      <CommunityModalProvider>
        <CommunityLayout />
      </CommunityModalProvider>
    </div>
  );
}
