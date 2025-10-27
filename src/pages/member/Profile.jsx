import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import "./MemberTheme.css";

// 동일 분리 함수(간단 복사)
const splitAddress = (maddr = "") => {
  const s = (maddr || "").trim();
  if (!s) return { base: "", detail: "" };
  const m1 = s.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (m1) return { base: m1[1].trim(), detail: m1[2].trim() };
  const tokens = s.split(/\s+/);
  const idx = tokens.findIndex((t) => /(동|층|호|호수|호실|번지|상가|아파트|빌라|타워|오피스텔)/.test(t));
  if (idx > 0) {
    const base = tokens.slice(0, idx).join(" ").trim();
    const detail = tokens.slice(idx).join(" ").trim();
    if (base && detail) return { base, detail };
  }
  return { base: s, detail: "" };
};

export default function Profile() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/member/me");
        if (data?.login === false) setMember(null);
        else setMember(data.member);
      } catch {
        setMember(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goToUpdate = () => navigate("/member/updateProfile");
  const goToChangePw = () => navigate("/member/changePw");

  if (loading) {
    return (
      <div className="member-page">
        <div className="m-card">불러오는 중...</div>
      </div>
    );
  }
  if (!member) {
    return (
      <div className="member-page">
        <div className="m-card">로그인이 필요합니다.</div>
      </div>
    );
  }

  const { base, detail } = splitAddress(member.maddr || "");

  return (
    <div className="member-page">
      <div className="m-card">
        <h2 className="m-title">마이페이지</h2>

        <div className="m-kv" style={{ marginTop: 12 }}>
          <div className="m-label">아이디</div><div>{member.mid}</div>
          <div className="m-label">이름</div><div>{member.mname}</div>
          <div className="m-label">이메일</div><div>{member.memail || "-"}</div>
          <div className="m-label">전화번호</div><div>{member.mtel || "-"}</div>
          <div className="m-label">생년월일</div><div>{member.mbirth || "-"}</div>
          <div className="m-label">우편번호</div><div>{member.mpost || "-"}</div>

          {/* ▶ 주소 표기 */}
          <div className="m-label">주소</div><div>{base || "-"}</div>
          {detail && (<><div className="m-label">상세주소</div><div>{detail}</div></>)}

          <div className="m-label">닉네임</div><div>{member.mnic || "-"}</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 className="m-title" style={{ fontSize: "1rem" }}>자녀 정보</h3>
          {member.children && member.children.length > 0 ? (
            <table className="m-table" style={{ marginTop: 8 }}>
              <thead><tr><th>이름</th><th>생년월일</th></tr></thead>
              <tbody>
                {member.children.map((child, index) => (
                  <tr key={index}><td>{child.chname}</td><td>{child.chbirth}</td></tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="m-muted" style={{ marginTop: 8 }}>등록된 자녀 정보가 없습니다.</p>
          )}
        </div>

        <div className="m-actions" style={{ marginTop: 16 }}>
          <button onClick={goToChangePw} className="m-btn">비밀번호 변경</button>
          <button onClick={goToUpdate} className="m-btn ghost">내 정보 변경하기</button>
        </div>
      </div>
    </div>
  );
}
