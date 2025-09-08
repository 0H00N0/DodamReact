import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 추가
import '../../App.css';

const ChangePw = () => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // 추가
  const handleSubmit = e => {
    e.preventDefault();

    if (newPw !== confirmPw) {
      setMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    axios.put('http://localhost:8080/member/changePw', {
      currentPw: currentPw,
      newPw: newPw
}, { withCredentials: true })
      .then(() => {
        setMessage('비밀번호가 성공적으로 변경되었습니다.');
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
        alert('비밀번호 변경이 완료되었습니다.');
        navigate('/member/profile'); // 비밀번호 변경 후 프로필 페이지로 이동
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
        <button type="submit" style={{
        marginTop:16,
        padding: "12px 24px",
        background: "#1976d2",
        color: "#fff",
        borderRadius: "6px",
        fontSize: "16px",
        border: "none",
        cursor: "pointer"
        }}>변경하기</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ChangePw;