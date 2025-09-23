import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const ChangePw = () => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = e => {
    e.preventDefault();

    if (newPw !== confirmPw) {
      setMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    axios.put('http://localhost:8080/api/member/me/password', {
      currentPw,
      newPw
    }, { withCredentials: true })
      .then(() => {
        setMessage('비밀번호가 성공적으로 변경되었습니다.');
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      })
      .catch(err => {
        console.error('비밀번호 변경 실패:', err);
        setMessage('비밀번호 변경 중 오류가 발생했습니다.');
      });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>비밀번호 변경</h3>
      <form onSubmit={handleSubmit}>
        <label>현재 비밀번호: <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required /></label><br />
        <label>새 비밀번호: <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required /></label><br />
        <label>새 비밀번호 확인: <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required /></label><br />
        <button type="submit">변경하기</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ChangePw;