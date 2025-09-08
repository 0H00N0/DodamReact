import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

const profile = () => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const goToChangePw = () => {
    navigate('/changePw');
  };
  
  useEffect(() => {
    axios.get('http://localhost:8080/api/member/me', { withCredentials: true })
      .then(response => {
        setMember(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('회원 정보 불러오기 실패:', error);
        alert('회원 정보를 불러오는데 실패하였습니다.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (!member) return <div>회원 정보를 불러올 수 없습니다.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>마이페이지</h2>
      <p><strong>이름:</strong> {member.mname}</p>
      <p><button onClick={goToChangePw}>비밀번호 변경</button></p>   
      <p><strong>이메일:</strong> {member.memail}</p>
      <p><strong>가입일:</strong> {member.createdAt}</p>
      <p><strong>닉네임:</strong> {member.mnic}</p>
      <p><strong>전화번호:</strong> {member.mtel}</p>
      <p><strong>주소:</strong> {member.maddr}</p>
      <p><strong>생년월일:</strong> {member.mbirth}</p>
    </div>

  );
};

export default profile;