import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEventById, joinEvent } from "../../api/eventApi"; // API 모듈 임포트

const EventDetail = () => {
  const { eventId } = useParams(); // App.js의 :eventId 파라미터를 받음
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 이벤트 참여 폼 상태
  const [mNum, setMNum] = useState(''); // 실제로는 로그인 상태에서 가져와야 함
  const [lotNum, setLotNum] = useState('');
  const [joinMessage, setJoinMessage] = useState({ type: '', text: '' });

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

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!mNum) {
      alert("회원 번호를 입력하세요.");
      return;
    }
    const joinRequest = {
      evNum: event.evNum,
      mNum: parseInt(mNum, 10),
      // 이벤트 타입이 'DRAWING'일 때만 lotNum 포함
      ...(event.eventType === 'DRAWING' && { lotNum: parseInt(lotNum, 10) })
    };
    try {
      const response = await joinEvent(joinRequest);
      setJoinMessage({ type: 'success', text: response.data });
    } catch (err) {
      setJoinMessage({ type: 'error', text: `참여 실패: ${err.response?.data || err.message}` });
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>로딩 중...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!event) return null; // 이벤트 정보가 없으면 아무것도 렌더링하지 않음

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h1>{event.evName}</h1>
      <p style={{ color: "gray", fontSize: "14px" }}>
        기간: {new Date(event.startTime).toLocaleString()} ~ {new Date(event.endTime).toLocaleString()}
      </p>
      <div style={{ padding: "20px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", margin: "20px 0" }}>
        <p>{event.evContent}</p>
      </div>

      {/* --- 이벤트 참여 폼 --- */}
      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #f0f0f0", borderRadius: "8px" }}>
        <h3>이벤트 참여하기</h3>
        <form onSubmit={handleJoinSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>회원 번호: </label>
            <input type="number" value={mNum} onChange={(e) => setMNum(e.target.value)} placeholder="회원 번호를 입력하세요" required style={{ padding: "5px" }}/>
          </div>
          {event.eventType === 'DRAWING' && (
            <div style={{ marginBottom: "10px" }}>
              <label>추첨권 번호: </label>
              <input type="number" value={lotNum} onChange={(e) => setLotNum(e.target.value)} placeholder="추첨권 번호를 입력하세요" required style={{ padding: "5px" }}/>
            </div>
          )}
          <button type="submit" style={{ padding: "8px 15px", cursor: "pointer" }}>참여</button>
        </form>
        {joinMessage.text && (
          <p style={{ color: joinMessage.type === 'success' ? 'blue' : 'red', marginTop: '10px' }}>
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