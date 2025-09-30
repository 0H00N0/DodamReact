// src/pages/CommunityPage/Event.jsx
import React from "react";
import { Link } from "react-router-dom";

const events = [
  { id: 1, title: "가을 할인 이벤트 🍂", date: "2025-09-10", content: "가을맞이 최대 50% 할인 이벤트 진행 중!" },
  { id: 2, title: "신학기 학습완구 특별 할인 🎁", date: "2025-09-02", content: "신학기 맞이 학습완구 최대 30% 할인!" }
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