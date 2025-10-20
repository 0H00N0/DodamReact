import React, { useState } from 'react';
import axios from 'axios';

export default function FindIdByTel() {
  const [mname, setMname] = useState('');
  const [mtel, setMtel] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get('http://localhost:8080/member/findIdByTel', {
        params: { mname, mtel }
      });
      setResult(`찾은 ID: ${res.data.mid}`);
    } catch (err) {
      setResult('회원 정보를 찾을 수 없습니다.');
    }
  };

  return (
    <div>
      <h2>전화번호로 ID 찾기</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="이름"
          value={mname}
          onChange={e => setMname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="전화번호"
          value={mtel}
          onChange={e => setMtel(e.target.value)}
          required
        />
        <button type="submit">찾기</button>
      </form>
      <p>{result}</p>
    </div>
  );
}