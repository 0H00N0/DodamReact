import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEventById, joinEvent } from "../../api/eventApi"; // API 모듈 임포트

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mNum, setMNum] = useState(""); 
  const [lotNum, setLotNum] = useState("");
  const [joinMessage, setJoinMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await getEventById(eventId);
        setEvent(response.data);
      } catch (err) {
        setError("이벤트 정보를 찾을 수 없습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetail();
  }, [eventId]);

  // ✅ 마감 여부 판단 함수
  const isClosed = () => {
    if (!event) return true;

    const now = new Date();
    if (event.status === 2) return true; // DB상 종료 상태
    if (event.endTime && now > new Date(event.endTime)) return true; // 종료일 지나면
    if (event.capacity && event.currentParticipants >= event.capacity) return true; // 정원 초과

    return false;
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!mNum) {
      alert("회원 번호를 입력하세요.");
      return;
    }
    const joinRequest = {
      evNum: event.evNum,
      mnum: parseInt(mNum, 10),
      ...(event.eventType === "DRAWING" && { lotNum: parseInt(lotNum, 10) }),
    };

    try {
      const response = await joinEvent(joinRequest);
      setJoinMessage({ type: "success", text: response.data });
      // 🔄 참여 성공 후 이벤트 다시 불러와서 참가자 수 갱신
      const updated = await getEventById(eventId);
      setEvent(updated.data);
    } catch (err) {
      setJoinMessage({
        type: "error",
        text: `참여 실패: ${err.response?.data || err.message}`,
      });
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>로딩 중...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!event) return null;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h1>{event.evName}</h1>
      <p style={{ color: "gray", fontSize: "14px" }}>
        기간: {new Date(event.startTime).toLocaleString()} ~{" "}
        {new Date(event.endTime).toLocaleString()}
      </p>

      <div
        style={{
          padding: "20px 0",
          borderTop: "1px solid #eee",
          borderBottom: "1px solid #eee",
          margin: "20px 0",
        }}
      >
        <p>{event.evContent}</p>
      </div>

      {/* --- 이벤트 참여 폼 --- */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
        }}
      >
        <h3>이벤트 참여하기</h3>
        {isClosed() ? (
          <p style={{ color: "red" }}>⚠️ 이 이벤트는 마감되었습니다.</p>
        ) : (
          <form onSubmit={handleJoinSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label>회원 번호: </label>
              <input
                type="number"
                value={mNum}
                onChange={(e) => setMNum(e.target.value)}
                placeholder="회원 번호를 입력하세요"
                required
                style={{ padding: "5px" }}
              />
            </div>
            {event.eventType === "DRAWING" && (
              <div style={{ marginBottom: "10px" }}>
                <label>추첨권 번호: </label>
                <input
                  type="number"
                  value={lotNum}
                  onChange={(e) => setLotNum(e.target.value)}
                  placeholder="추첨권 번호를 입력하세요"
                  required
                  style={{ padding: "5px" }}
                />
              </div>
            )}
            <button
              type="submit"
              style={{ padding: "8px 15px", cursor: "pointer" }}
              disabled={isClosed()}
            >
              {isClosed() ? "마감됨" : "참여"}
            </button>
          </form>
        )}

        {joinMessage.text && (
          <p
            style={{
              color: joinMessage.type === "success" ? "blue" : "red",
              marginTop: "10px",
            }}
          >
            {joinMessage.text}
          </p>
        )}
      </div>

      <br />
      <Link to="/board/event">← 목록으로 돌아가기</Link>
    </div>
  );
};

export default EventDetail;
