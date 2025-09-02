import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const updateProfile = () => {
  const [form, setForm] = useState({
    memail: '',
    mtel: '',
    maddr: '',
    mpost: '',
    mnic: ''
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // 회원 정보 불러오기
  useEffect(() => {
    axios.get('http://localhost:8080/api/member/me', { withCredentials: true })
      .then(res => {
        const data = res.data;
        setForm({
          memail: data.memail || '',
          mtel: data.mtel || '',
          maddr: data.maddr || '',
          mpost: data.mpost || '',
          mnic: data.mnic || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('회원 정보 로딩 실패:', err);
        setLoading(false);
      });
  }, []);

  // 입력값 변경 
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 수정 요청
  const handleSubmit = e => {
    e.preventDefault();
    axios.put('http://localhost:8080/api/member/me', form, { withCredentials: true })
      .then(() => setMessage('회원 정보가 성공적으로 수정되었습니다.'))
      .catch(err => {
        console.error('수정 실패:', err);
        setMessage('수정 중 오류가 발생했습니다.');
      });
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>회원정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <label>이메일: <input type="email" name="memail" value={form.memail} onChange={handleChange} /></label><br />
        <label>전화번호: <input type="text" name="mtel" value={form.mtel} onChange={handleChange} /></label><br />
        <label>주소: <input type="text" name="maddr" value={form.maddr} onChange={handleChange} /></label><br />
        <label>우편번호: <input type="number" name="mpost" value={form.mpost} onChange={handleChange} /></label><br />
        <label>닉네임: <input type="text" name="mnic" value={form.mnic} onChange={handleChange} /></label><br />
        <button type="submit">수정하기</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default updateProfile;