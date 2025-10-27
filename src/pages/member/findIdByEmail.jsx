import React, { useState } from 'react';
import axios from 'axios';

import "./MemberTheme.css";

export default function FindIdByEmail() {
  const [mname, setMname] = useState('');
  const [memail, setMemail] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const res = await axios.get('http://localhost:8080/member/findIdByEmail', {
      params: { mname, memail }
    });
      setResult(`찾은 ID: ${res.data.mid}`);
    } catch (err) {
      setResult('회원 정보를 찾을 수 없습니다.');
    }
  };

  return (
    <div className="member-page">
      <div className="m-card wide">
    <div>
      <h2>이메일로 ID 찾기</h2>
      <form className="m-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="이름"
          value={mname}
          onChange={e => setMname(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="이메일"
          value={memail}
          onChange={e => setMemail(e.target.value)}
          required
        />
        <button type="submit">찾기</button>
      </form>
      <p>{result}</p>
    </div>
      </div>
    </div>
  );
}