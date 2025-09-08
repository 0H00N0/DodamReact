import React from "react";

export default function FindIdModal({ onClose, onSelect }) {
  return (
    <div style={modalStyle}>
      <h3>ID 찾기</h3>
      <button onClick={() => onSelect("email")}>이메일로 찾기</button>
      <button onClick={() => onSelect("tel")}>전화번호로 찾기</button>
      <button onClick={onClose}>닫기</button>
    </div>
  );
}

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  zIndex: 1000,
};