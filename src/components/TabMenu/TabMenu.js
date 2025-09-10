import React, { useState } from "react";
import styles from './TabMenu.module.css';

const TabMenu = () => {
  const [activeTab, setActiveTab] = useState("공지사항");

  return (
    <div className={styles.container}>
  <h2 className={styles.pageTitle}>소통 페이지</h2>

      <nav className="tabNav"> 
        <ul className="tabList">
          {["공지사항","이벤트","커뮤니티","문의","FAQ","회사소개"].map(tab => (
            <li key={tab}>
              <a 
                href="#" 
                className={`${styles.tabLink} ${activeTab === tab ? styles.active : ""}`}
                onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}
              >
                {tab}
              </a>
            </li>
          ))}
        </ul>
      </nav>  

      <div className={styles.content}>
    {activeTab} 내용이 여기에 표시됩니다.
      </div>
    </div>
  );
};

export default TabMenu;