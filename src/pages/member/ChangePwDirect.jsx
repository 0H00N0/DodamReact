import { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

import "./MemberTheme.css";

export default function ChangePwDirect() {
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [result, setResult] = useState('');
  const location = useLocation();
  const mid = location.state?.mid || '';

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setResult('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      await axios.put('http://localhost:8080/member/changePwDirect', { mid, newPw });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      window.close();
    } catch (err) {
      setResult('비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <div className="member-page">
      <div className="m-card">
    <form className="m-form" onSubmit={handleChangePw}>
      <input
        type="password"
        value={newPw}
        onChange={e => setNewPw(e.target.value)}
        placeholder="새 비밀번호"
        autoComplete="new-password"
      />
      <input
        type="password"
        value={confirmPw}
        onChange={e => setConfirmPw(e.target.value)}
        placeholder="비밀번호 확인"
        autoComplete="new-password"
      />
      <button type="submit">비밀번호 변경</button>
      <div>{result}</div>
    </form>
      </div>
    </div>
  );
}