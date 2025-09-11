import { useState } from "react";
import axios from "axios";

export default function FindPwByMtel() {
  const [mid, setMid] = useState('');
  const [mname, setMname] = useState('');
  const [mtel, setMtel] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [result, setResult] = useState('');

  // 1단계: 정보 확인
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/member/findPwByMtel', { mid, mname, mtel });
      setVerified(true);
      setResult('');
    } catch (err) {
      setResult('회원정보가 일치하지 않습니다.');
    }
  };

  // 2단계: 비밀번호 변경
  const handleChangePw = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/member/changePw', { mid, newPw });
      setResult('비밀번호가 성공적으로 변경되었습니다.');
    } catch (err) {
      setResult('비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <div>
      {!verified ? (
        <form onSubmit={handleVerify}>
          <input value={mid} onChange={e => setMid(e.target.value)} placeholder="아이디" />
          <input value={mname} onChange={e => setMname(e.target.value)} placeholder="이름" />
          <input value={mtel} onChange={e => setMtel(e.target.value)} placeholder="전화번호" />
          <button type="submit">정보 확인</button>
          <div>{result}</div>
        </form>
      ) : (
        <form onSubmit={handleChangePw}>
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="새 비밀번호"
          />
          <button type="submit">비밀번호 변경</button>
          <div>{result}</div>
        </form>
      )}
    </div>
  );
}