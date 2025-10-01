// src/pages/CommunityPage/EventDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

const events = [
  { id: 1, title: "가을 할인 이벤트", date: "2025-09-10", content: "가을 맞이 특별 할인 이벤트! 최대 50% 할인." },
  { id: 2, title: "신상품 런칭 이벤트", date: "2025-09-15", content: "신상품 런칭 기념 이벤트, 참여 시 경품 증정." },
  { id: 3, title: "블록 놀이 체험 이벤트", date: "2025-09-20", content: "직접 체험하고 후기 작성 시 상품 증정." },
];

const EventDetail = () => {
  const { eventId } = useParams();
  const event = events.find((e) => e.id === Number(eventId));

  if (!event) return <p>이벤트를 찾을 수 없습니다.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{event.title}</h1>
      <p style={{ color: "gray", fontSize: "14px" }}>{event.date}</p>
      <p>{event.content}</p>
      <br />
      <Link to="/board/event">← 목록으로 돌아가기</Link>
    </div>
  );
};

export default EventDetail;