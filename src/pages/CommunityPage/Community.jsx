// src/pages/CommunityPage/Community.jsx
import React from "react";
import { Link } from "react-router-dom";

// 샘플 커뮤니티 게시글 데이터
const posts = [
  { id: 1, title: "자기소개 게시판", date: "2025-09-01", content: "여러분 안녕하세요! 자기소개 글입니다." },
  { id: 2, title: "취미 공유", date: "2025-09-03", content: "저의 취미는 사진 촬영입니다." },
  { id: 3, title: "스터디 모집", date: "2025-09-05", content: "React 스터디 같이 하실 분 모집합니다." }
];

const Community = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>💬 커뮤니티</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
            {/* 상세 페이지로 이동 */}
            <Link to={`/board/community/${post.id}`} style={{ textDecoration: "none", color: "black" }}>
              <h2>{post.title}</h2>
            </Link>
            <p style={{ color: "gray", fontSize: "14px" }}>{post.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Community;