// src/pages/CommunityPage/Event.jsx
import React from "react";
import { Link } from "react-router-dom";

const events = [
  { id: 1, title: "가을 할인 이벤트", date: "2025-09-10", content: "가을 맞이 특별 할인 이벤트! 최대 50% 할인." },
  { id: 2, title: "신상품 런칭 이벤트", date: "2025-09-15", content: "신상품 런칭 기념 이벤트, 참여 시 경품 증정." },
  { id: 3, title: "블록 놀이 체험 이벤트", date: "2025-09-20", content: "직접 체험하고 후기 작성 시 상품 증정." },
];

const Event = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>🎉 이벤트</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
            <Link to={`/board/event/${event.id}`} style={{ textDecoration: "none", color: "black" }}>
              <h2>{event.title}</h2>
            </Link>
            <p style={{ color: "gray", fontSize: "14px" }}>{event.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Event;