// src/pages/CommunityPage/CommunityLayout.jsx
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useScrollMemory } from "./CommunityScrollMemory"; // ✅ 스크롤 훅 추가
import styles from "./CommunityPage.module.css";

export default function CommunityLayout() {
  const { pathname } = useLocation();

  // ✅ 페이지 진입 시 최상단 이동 + 뒤로가기 시 복원
  useScrollMemory({ scrollTopOnMount: true, behavior: "auto" });

  const menus = [
    { to: "/board/notice", label: "공지사항" },
    { to: "/board/event", label: "이벤트" },
    { to: "/board/community", label: "커뮤니티" },
    { to: "/board/inquiry", label: "문의" },
    { to: "/board/faq", label: "FAQ" },
    { to: "/board/company", label: "회사소개" },
    { to: "/board/smartboard", label: "스마트 보드" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.pageH1}>소통 페이지</h1>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {menus.map((m) => {
              const active = pathname === m.to || pathname.startsWith(m.to + "/");
              return (
                <NavLink
                  key={m.to}
                  to={m.to}
                  className={active ? `${styles.navLink} ${styles.active}` : styles.navLink}
                >
                  {m.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
