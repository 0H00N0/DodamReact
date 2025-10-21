import React from "react";
import { useNavigate } from "react-router-dom";

export default function FindIdModal() {
  const nav = useNavigate();

  const goToEmail = () => nav("/member/findIdByEmail");
  const goToTel   = () => nav("/member/findIdByTel");
  const closeWindow = () => {
    if (window.opener) window.close();
    else nav(-1);
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h3>ID 찾기</h3>
        <button onClick={goToEmail}>이메일로 찾기</button>
        <button onClick={goToTel}>전화번호로 찾기</button>
        <button onClick={closeWindow}>닫기</button>
      </div>
    </div>
  );
}

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
