// src/pages/CommunityPage/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CommunityBoardList from "./CommunityBoardList";
import CommunityBoardDetail from "./CommunityBoardDetail";
import CommunityBoardForm from "./CommunityBoardForm";

/** ✅ 디폴트 export로 "컴포넌트"를 내보냅니다 (객체 X) */
export default function CommunityRoutes() {
  return (
    <Routes>
      <Route index element={<CommunityBoardList />} />
      <Route path="new" element={<CommunityBoardForm />} />
      <Route path=":bnum" element={<CommunityBoardDetail />} />
      <Route path=":bnum/edit" element={<CommunityBoardForm />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
