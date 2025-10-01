import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MainFeedVertical.module.css";
import {
  fetchLatestReviews,
  fetchLatestNotices,
  fetchPopularCommunity,
} from "../MainFeedApi";

const PH = "https://dummyimage.com/80x80/eeeeee/999&text=No+Image";

export default function MainFeedVertical() {
  const nav = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [notices, setNotices] = useState([]);
  const [hots, setHots] = useState([]);

  useEffect(() => {
    (async () => {
      const [r, n, h] = await Promise.all([
        fetchLatestReviews(3),
        fetchLatestNotices(3),
        fetchPopularCommunity(3),
      ]);
      setReviews(r || []);
      setNotices(n || []);
      setHots(h || []);
    })();
  }, []);

  const toDate = (s) => (s ? s.slice(0, 10) : "");

  return (
    <section className={`${styles.wrapper} ${styles.pinkTheme}`}>
      <h2 className={styles.sectionTitle}>지금 담아온 소식</h2>

      {/* 최근 리뷰 */}
      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h3>최근 리뷰</h3>
          <button className={styles.more} onClick={() => nav("/board/reviews")}>더보기</button>
        </div>
        <ul className={styles.list}>
          {reviews.map((it) => (
            <li key={it.revId} className={styles.item}
                onClick={() => nav(`/products/${it.proId}`)}>
              <img src={it.imageUrl || PH} alt={it.proName} className={styles.thumb} />
              <div className={styles.meta}>
                <div className={styles.title} title={it.title}>{it.title || "(제목 없음)"}</div>
                <div className={styles.sub}>
                  <span className={styles.badge}>★ {it.score ?? 0}</span>
                  <span className={styles.dim}>{it.proName}</span>
                  <span className={styles.dim}>{toDate(it.createdAt)}</span>
                </div>
              </div>
            </li>
          ))}
          {!reviews.length && <li className={styles.empty}>등록된 리뷰가 없습니다.</li>}
        </ul>
      </div>

      {/* 공지사항 */}
      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h3>공지사항</h3>
          <button className={styles.more} onClick={() => nav("/board/notice")}>더보기</button>
        </div>
        <ul className={styles.list}>
          {notices.map((it) => (
            <li key={it.postId} className={styles.item}
                onClick={() => nav(`/board/notice/${it.postId}`)}>
              <div className={styles.icon}>📢</div>
              <div className={styles.meta}>
                <div className={styles.title} title={it.title}>{it.title || "(제목 없음)"}</div>
                <div className={styles.sub}>
                  <span className={styles.dim}>{it.author}</span>
                  <span className={styles.dim}>{toDate(it.createdAt)}</span>
                </div>
              </div>
            </li>
          ))}
          {!notices.length && <li className={styles.empty}>공지사항이 없습니다.</li>}
        </ul>
      </div>

      {/* 커뮤니티 인기글 */}
      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h3>커뮤니티 인기글</h3>
          <button className={styles.more} onClick={() => nav("/board/community")}>더보기</button>
        </div>
        <ul className={styles.list}>
          {hots.map((it) => (
            <li key={it.postId} className={styles.item}
                onClick={() => nav(`/board/community/${it.postId}`)}>
              <div className={styles.icon}>🔥</div>
              <div className={styles.meta}>
                <div className={styles.title} title={it.title}>{it.title || "(제목 없음)"}</div>
                <div className={styles.sub}>
                  <span className={styles.dim}>{it.author}</span>
                  <span className={styles.dim}>{toDate(it.createdAt)}</span>
                </div>
              </div>
            </li>
          ))}
          {!hots.length && <li className={styles.empty}>게시글이 없습니다.</li>}
        </ul>
      </div>
    </section>
  );
}
