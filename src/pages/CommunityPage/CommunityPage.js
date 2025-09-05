import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styles from "../../Board/CommunityPage.module.css"; // CSS 경로 수정

const CommunityPage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop();

  const tabs = [
    { title: "공지사항", path: "notice" },
    { title: "이벤트", path: "event" },
    { title: "문의", path: "inquiry" },
    { title: "FAQ", path: "faq" },
    { title: "회사소개", path: "company" },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>소통 페이지</h2>

      {/* 탭 메뉴 */}
      <nav className={styles.tabNav}>
        <ul className={styles.tabList}>
          {tabs.map((tab) => (
            <li key={tab.path} className={styles.tabItem}>
              <Link
                to={tab.path}
                className={`${styles.tabLink} ${
                  currentTab === tab.path ? styles.active : ""
                }`}
              >
                {tab.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 내용 영역 */}
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default CommunityPage;