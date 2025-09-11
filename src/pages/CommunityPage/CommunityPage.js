import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styles from "./CommunityPage.module.css"

const CommunityPage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop();

  const tabs = [
    { title: "공지사항", path: "notice" },
    { title: "이벤트", path: "event" },
    { title: "커뮤니티", path: "community" },
    { title: "문의", path: "inquiry" },
    { title: "FAQ", path: "faq" },
    { title: "회사소개", path: "company" },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>소통 페이지</h2>

      {/* 전체 레이아웃: 왼쪽 메뉴 + 오른쪽 내용 */}
      <div className={styles.layout}>


      {/* 왼쪽 세로 메뉴 */}
        <nav className={styles.sidebar}>
          <ul className={styles.menuList}>
          {tabs.map((tab) => (
            <li key={tab.path}>
              <Link
                to={`/board/${tab.path}`}
                className={`${styles.menuLink} ${
                    currentTab === tab.path ? styles.active : ""
                  }`}
                >
                  {tab.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 오른쪽 내용 영역 */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;