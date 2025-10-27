import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './MemberTheme.css';

export default function ChangePw() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (newPw !== confirmPw) {
      setMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await axios.put(
        'http://localhost:8080/member/changePw',
        { currentPw, newPw },
        { withCredentials: true }
      );
      alert('비밀번호 변경이 완료되었습니다.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      navigate('/member/profile');
    } catch (err) {
      console.error('비밀번호 변경 실패:', err);
      setMessage('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="member-page">
      <div className="m-card" style={{ maxWidth: 640, margin: '0 auto' }}>
        <h3 className="m-title" style={{ marginBottom: 12 }}>비밀번호 변경</h3>

        <form className="m-form" onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
          <div className="m-row">
            <label className="m-label" htmlFor="cur">현재 비밀번호</label>
            <input
              id="cur"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="m-input"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="m-row">
            <label className="m-label" htmlFor="new">새 비밀번호</label>
            <input
              id="new"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="m-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="m-row">
            <label className="m-label" htmlFor="confirm">새 비밀번호 확인</label>
            <input
              id="confirm"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="m-input"
              autoComplete="new-password"
              required
            />
          </div>

          {message && (
            <div className="m-error" role="alert">{message}</div>
          )}

          <div className="m-actions" style={{ marginTop: 8 }}>
            <button type="submit" className="m-btn">변경하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}
