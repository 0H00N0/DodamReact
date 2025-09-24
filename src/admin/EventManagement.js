// src/admin/EventManagement.js
import React, { useEffect, useState } from 'react';
import { useAdmin } from './contexts/AdminContext';

function EventManagement() {
  const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = useAdmin();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    evName: '',
    evContent: '',
    eventType: 'FIRST',  // 기본값
    status: 0,
    startTime: '',
    endTime: '',
    capacity: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await getAllEvents();
    setEvents(data);
  };

  const handleSelect = async (evNum) => {
    const data = await getEventById(evNum);
    setSelectedEvent(data);
    setFormData({
      evName: data.evName,
      evContent: data.evContent,
      eventType: data.eventType || 'FIRST',
      status: data.status,
      startTime: data.startTime ? data.startTime.substring(0, 16) : '',
      endTime: data.endTime ? data.endTime.substring(0, 16) : '',
      capacity: data.capacity || ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    await createEvent(formData);
    loadEvents();
    setFormData({
      evName: '',
      evContent: '',
      status: 0,
      startTime: '',
      endTime: '',
      capacity: '',
      eventType: 'FIRST'
    });
  };

  const handleUpdate = async () => {
    if (!selectedEvent) return;
    await updateEvent(selectedEvent.evNum, formData);
    loadEvents();
  };

  const handleDelete = async (evNum) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteEvent(evNum);
      loadEvents();
      setSelectedEvent(null);
    }
  };

  return (
    <div className="dashboard">
      <h1>이벤트 관리</h1>

      {/* 이벤트 목록 */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>유형</th>
            <th>정원</th>
            <th>상태</th>
            <th>시작</th>
            <th>종료</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.evNum} onClick={() => handleSelect(ev.evNum)}>
              <td>{ev.evNum}</td>
              <td>{ev.evName}</td>
              <td>{ev.eventType}</td>
              <td>{ev.capacity || '-'}</td>
              <td>{ev.status}</td>
              <td>{ev.startTime}</td>
              <td>{ev.endTime}</td>
              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(ev.evNum);
                  }}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="dashboard-section">
        <h2>{selectedEvent ? '이벤트 수정' : '새 이벤트 생성'}</h2>

        <input
          type="text"
          name="evName"
          placeholder="이벤트 이름"
          value={formData.evName}
          onChange={handleChange}
        />

        <textarea
          name="evContent"
          placeholder="이벤트 내용"
          value={formData.evContent}
          onChange={handleChange}
        />

        {/* 이벤트 유형 선택 */}
        <label>이벤트 유형</label>
        <select name="eventType" value={formData.eventType} onChange={handleChange}>
          <option value="FIRST">선착순</option>
          <option value="DRAWING">추첨</option>
        </select>

        {/* 선착순일 때만 capacity 입력 */}
        {formData.eventType === 'FIRST' && (
          <div>
            <label>정원</label>
            <input
              type="number"
              name="capacity"
              placeholder="참여 정원"
              value={formData.capacity}
              onChange={handleChange}
            />
          </div>
        )}

        {/* 상태 선택 */}
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value={0}>예정</option>
          <option value={1}>진행중</option>
          <option value={2}>종료</option>
        </select>

        <input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
        />

        <div>
          {selectedEvent ? (
            <button onClick={handleUpdate}>수정</button>
          ) : (
            <button onClick={handleCreate}>생성</button>
          )}
        </div>
      </div>

      {/* 단건 조회 결과 */}
      {selectedEvent && (
        <div className="dashboard-section">
          <h2>선택된 이벤트</h2>
          <p>ID: {selectedEvent.evNum}</p>
          <p>이름: {selectedEvent.evName}</p>
          <p>내용: {selectedEvent.evContent}</p>
          <p>유형: {selectedEvent.eventType}</p>
          <p>정원: {selectedEvent.capacity || '-'}</p>
          <p>상태: {selectedEvent.status}</p>
          <p>시작: {selectedEvent.startTime}</p>
          <p>종료: {selectedEvent.endTime}</p>
        </div>
      )}
    </div>
  );
}

export default EventManagement;
