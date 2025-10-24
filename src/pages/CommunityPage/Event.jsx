import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllEvents } from "../../api/eventApi"; // API 모듈 임포트
import styles from "./CommunityPage.module.css";   // 공지/이벤트 공용 스타일 사용

const fmt = (v) => {
  const d = new Date(v);
  if (isNaN(d)) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${dd}`;
};

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getAllEvents();     // evNum / evName / startTime
        setEvents(response.data ?? []);
      } catch (err) {
        console.error(err);
        setError("이벤트 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className={styles.loading}>로딩 중…</div>;
  if (error) return <div className={styles.empty}>{error}</div>;

  // 공지 리스트와 동일한 좌측 정렬 카드 레이아웃
  return (
    <section className={styles.noticeList}>
      <h2 className={styles.panelTitle}>이벤트</h2>

      {events.length === 0 && (
        <div className={styles.empty}>진행 중인 이벤트가 없습니다.</div>
      )}

      <ul className={styles.cardList}>
        {events.map((event) => (
          <li key={event.evNum} className={styles.cardListItem}>
            <Link
              to={`/board/event/${event.evNum}`}
              className={styles.noticeCardLink}
            >
              <article className={styles.noticeCard}>
                <div className={styles.noticeHead}>
                  <div className={styles.noticeIcon} aria-hidden>🎉</div>
                  <div className={styles.noticeTitleWrap}>
                    <h3 className={styles.noticeTitle}>{event.evName}</h3>
                    <div className={styles.noticeMeta}>
                      시작일: {fmt(event.startTime)}
                    </div>
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

export default Event;
