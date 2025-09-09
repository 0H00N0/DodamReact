import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from './TabMenu.module.css';

const TabMenu = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/"); 
  const currentTab = pathParts[2] || "notice"; // /board/notice 기준

  const tabs = [
    { name: "공지사항", path: "notice" },
    { name: "이벤트", path: "event" },
    { name: "커뮤니티", path: "community" },
    { name: "문의", path: "inquiry" },
    { name: "FAQ", path: "faq" },
    { name: "회사소개", path: "company" }
  ];

  return (
    <div className={styles.container}>

      {/* 제목과 탭 메뉴를 같은 수평선에 배치 */}
      <div className={styles.headerWrapper}>
        <h2 className={styles.pageTitle}>소통 페이지</h2>
        <nav>
          <ul className={styles.tabList}>
            {tabs.map(tab => (
              <li key={tab.path}>
                <Link
                  to={`/board/${tab.path}`}
                  className={`${styles.tabLink} ${currentTab === tab.path ? styles.active : ""}`}
                >
                  {tab.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* 선택된 탭 내용 표시 */}
      <div className={styles.content}>
        {currentTab} 내용이 여기에 표시됩니다.
      </div>
    </div>
  );
};

export default TabMenu;