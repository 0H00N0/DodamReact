import React from "react";

export default function FindIdModal() {
  const goToEmail = () => {
    window.location.href = "/member/findid/email";
  };
  const goToTel = () => {
    window.location.href = "/member/findid/tel";
  };
  const closeWindow = () => {
    window.close();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>ID 찾기</h3>
        <button onClick={goToEmail}>이메일로 찾기</button>
        <button onClick={goToTel}>전화번호로 찾기</button>
        <button onClick={closeWindow}>닫기</button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.2)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  zIndex: 2100,
  minWidth: 300,
  textAlign: "center"
};