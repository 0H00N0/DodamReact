import React from "react";
import { useNavigate } from "react-router-dom";

import "./MemberTheme.css";

export default function FindPw() {
  const nav = useNavigate();

  const goToEmail = () => nav("/member/findPwByMemail");
  const goToTel   = () => nav("/member/findPwByMtel");
  const closeWindow = () => {
    if (window.opener) window.close();  // 팝업이면 닫기
    else nav(-1);                        // 같은 탭이면 뒤로가기
  };

  return (
    <div className="member-page">
      <div className="m-card">
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h3>비밀번호 찾기</h3>
        <button onClick={goToEmail}>이메일로 찾기</button>
        <button onClick={goToTel}>전화번호로 찾기</button>
        <button onClick={closeWindow}>닫기</button>
      </div>
    </div>
      </div>
    </div>
  );
}

/** 페이지 전체를 흰색으로 채워 뒤 배경이 보이지 않게 */
const pageWrapperStyle = {
  minHeight: "100vh",
  background: "#fff",
  margin: 0,
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle = {
  backgroundColor: "#fff",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  minWidth: 300,
  textAlign: "center",
};
