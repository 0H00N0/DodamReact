import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/member/me");  // ★ 올바른 엔드포인트
        setMember(data);
      } catch {
        setMember(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goToUpdate = () => {
    navigate("/member/updateProfile");
  };
  const goToChangePw = () => {
    navigate("/member/changePw");
  }

  if (loading) return <div style={{padding:24}}>불러오는 중...</div>;
  if (!member) return <div style={{padding:24}}>로그인이 필요합니다.</div>;

  return (
    <div style={{padding:24}}>
      <h2>마이페이지</h2>
      <p><b>아이디:</b> {member.mid}</p>
      <button onClick={goToChangePw} style={{
        marginTop:16,
        padding: "12px 24px",
        background: "#1976d2",
        color: "#fff",
        borderRadius: "6px",
        fontSize: "16px",
        border: "none",
        cursor: "pointer"
      }}>비밀번호 변경</button>
      <p><b>이름:</b> {member.mname}</p>
      <p><b>이메일:</b> {member.memail}</p>
      <p><b>전화번호:</b> {member.mtel}</p>
      <p><b>생년월일:</b> {member.mbirth}</p>
      <p><b>우편번호:</b> {member.mpost}</p>
      <p><b>주소:</b> {member.maddr}</p>
      <p><b>닉네임:</b> {member.mnic}</p>
      <h3>자녀 정보</h3>
      {member.children && member.children.length > 0 ? (
        <ul>
          {member.children.map((child, index) => (
            <li key={index}>
              {child.chname} ({child.chbirth})
            </li>
          ))}
        </ul>
      ) : (
        <p>등록된 자녀 정보가 없습니다.</p>
      )}
      <button onClick={goToUpdate} style={{
        marginTop:16,
        padding: "12px 24px",
        background: "#1976d2",
        color: "#fff",
        borderRadius: "6px",
        fontSize: "16px",
        border: "none",
        cursor: "pointer"
        }}>내 정보 변경하기</button> 
    </div>
  );
}
