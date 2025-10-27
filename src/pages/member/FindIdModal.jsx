// src/pages/member/FindIdModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./MemberTheme.css";

export default function FindIdModal() {
  const nav = useNavigate();

  const goToEmail = () => nav("/member/findIdByEmail");
  const goToTel   = () => nav("/member/findIdByTel");
  const closeWindow = () => {
    if (window.opener) window.close();
    else nav(-1);
  };

  return (
    <div className="member-page">
      {/* 가운데 정렬된 작은 카드 */}
      <div className="m-card" style={{ width: "min(420px, 92vw)", margin: "40px auto" }}>
        <h2 className="m-title" style={{ marginBottom: 14 }}>ID 찾기</h2>

        {/* 2열 버튼(동일 폭) */}
        <div className="m-row-2" style={{ marginBottom: 10 }}>
          <button type="button" className="m-btn ghost" onClick={goToEmail}>
            이메일로 찾기
          </button>
          <button type="button" className="m-btn ghost" onClick={goToTel}>
            전화번호로 찾기
          </button>
        </div>

        {/* 닫기: 가득 버튼 */}
        <button type="button" className="m-btn m-wide" onClick={closeWindow}>
          닫기
        </button>
      </div>
    </div>
  );
}
