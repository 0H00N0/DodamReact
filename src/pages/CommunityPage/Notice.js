import React from "react";
import { Link } from "react-router-dom";
import styles from "./CommunityPage.module.css"; // 공용 CSS 적용

// 샘플 공지사항 데이터
const notices = [
  {
    id: 1,
    title: "추석 연휴 배송 안내",
    date: "2025-09-05",
    content:
      "추석 연휴 기간(9/12~9/15) 동안 배송이 중단됩니다. 9/10(수) 오후 2시 이전 결제 건까지는 연휴 전 발송됩니다.",
  },
  {
    id: 2,
    title: "신학기 맞이 학습완구 특별 할인전 🎁",
    date: "2025-09-02",
    content:
      "신학기를 맞아 학습완구를 최대 30% 할인합니다. (기간: 9/2~9/15)",
  },
  {
    id: 3,
    title: "인기 상품 재입고! 블록 놀이 세트",
    date: "2025-08-28",
    content:
      "품절되었던 블록 놀이 세트가 재입고되었습니다. 한정 수량으로 빠른 품절이 예상됩니다.",
  },
];

const Notice = () => {
  return (
    <section className={styles.noticeList}>
      <h2 className={styles.panelTitle}>공지사항</h2>

      {notices.length === 0 && (
        <div className={styles.empty}>등록된 공지사항이 없습니다.</div>
      )}

      <ul className={styles.cardList}>
        {notices.map((notice) => (
          <li key={notice.id} className={styles.cardListItem}>
            <Link
              to={`/board/notice/${notice.id}`}
              className={styles.noticeCardLink}
            >
              <article className={styles.noticeCard}>
                <div className={styles.noticeHead}>
                  <div className={styles.noticeIcon} aria-hidden>
                    📢
                  </div>
                  <div className={styles.noticeTitleWrap}>
                    <h3 className={styles.noticeTitle}>{notice.title}</h3>
                    <div className={styles.noticeMeta}>{notice.date}</div>
                  </div>
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Notice;
