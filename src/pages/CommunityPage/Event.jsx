import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllEvents } from "../../api/eventApi"; // API 모듈 임포트

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getAllEvents();
        // 백엔드 DTO 필드명(evNum, evName, startTime)에 맞춰 수정
        setEvents(response.data);
      } catch (err) {
        setError("이벤트 목록을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>로딩 중...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>🎉 이벤트</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((event) => (
          <li key={event.evNum} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
            {/* App.js 라우팅 경로에 맞춰 eventId 대신 evNum 사용 */}
            <Link to={`/board/event/${event.evNum}`} style={{ textDecoration: "none", color: "black" }}>
              <h2>{event.evName}</h2>
            </Link>
            <p style={{ color: "gray", fontSize: "14px" }}>
              {/* 날짜/시간 형식에 맞게 표시 */}
              시작일: {new Date(event.startTime).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Event;