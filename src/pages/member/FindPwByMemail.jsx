import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FindPwByMemail() {
  const [mid, setMid] = useState('');
  const [mname, setMname] = useState('');
  const [memail, setMemail] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  // 정보 확인만 처리, 인증 성공 시 비밀번호 변경 페이지로 이동
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/member/findPwByMemail', { mid, mname, memail });
      // 인증 성공 시 비밀번호 변경 페이지로 이동 (mid 전달)
      navigate("/member/changePwDirect", { state: { mid } });
    } catch (err) {
      setResult('회원정보가 일치하지 않습니다.');
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <input value={mid} onChange={e => setMid(e.target.value)} placeholder="아이디" />
      <input value={mname} onChange={e => setMname(e.target.value)} placeholder="이름" />
      <input value={memail} onChange={e => setMemail(e.target.value)} placeholder="이메일" />
      <button type="submit">정보 확인</button>
      <div>{result}</div>
    </form>
  );
}