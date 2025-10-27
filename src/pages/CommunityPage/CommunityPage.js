// src/pages/CommunityPage/CommunityPage.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import styles from "./CommunityPage.module.css";

import CommunityBoardList from "./CommunityBoardList";
import CommunityBoardDetail from "./CommunityBoardDetail";
import CommunityBoardForm from "./CommunityBoardForm";
import CommunityBoardEdit from "./CommunityBoardEdit";

export default function CommunityPage() {
  return (
    <section className={styles.container}>
      <Routes>
        {/* /board/community */}
        <Route index element={<CommunityBoardList />} />

        {/* /board/community/write */}
        <Route path="write" element={<CommunityBoardForm />} />

        {/* /board/community/:bnum */}
        <Route path=":bnum" element={<CommunityBoardDetail />} />

        {/* /board/community/:bnum/edit */}
        <Route path=":bnum/edit" element={<CommunityBoardEdit />} />

        {/* 알 수 없는 경로 → 목록 */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </section>
  );
}
