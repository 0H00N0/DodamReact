import React from "react";
import { Link } from "react-router-dom";

const notices = [
  { id: 1, title: "추석 연휴 배송 안내", date: "2025-09-05", content: "추석 연휴 기간..." },
  { id: 2, title: "신학기 맞이 학습완구 특별 할인전 🎁", date: "2025-09-02", content: "신학기를 맞아..." },
  { id: 3, title: "인기 상품 재입고! 블록 놀이 세트", date: "2025-08-28", content: "품절되었던..." }
];

const NoticeList = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>📢 공지사항</h1>
      <ul>
        {notices.map((notice) => (
          <li key={notice.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
            <Link to={`/board/notice/${notice.id}`} style={{ textDecoration: "none", color: "black" }}>
              <h2>{notice.title}</h2>
            </Link>
            <p style={{ color: "gray", fontSize: "14px" }}>{notice.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoticeList;