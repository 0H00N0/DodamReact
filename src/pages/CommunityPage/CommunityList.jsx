// src/pages/CommunityPage/CommunityList.jsx
import React from "react";
import { Link } from "react-router-dom";

const posts = [
  { id: 1, title: "우리 강아지 자랑", date: "2025-09-05", content: "오늘 산책 중 찍은 사진 공유합니다!" },
  { id: 2, title: "취미 공유", date: "2025-09-06", content: "저는 DIY 만들기를 좋아합니다." },
];

const CommunityList = () => (
  <div style={{ padding: "20px" }}>
    <h1>💬 커뮤니티</h1>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {posts.map(post => (
        <li key={post.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
          <Link to={`/board/community/${post.id}`} style={{ textDecoration: "none", color: "black" }}>
            <h2>{post.title}</h2>
          </Link>
          <p style={{ color: "gray", fontSize: "14px" }}>{post.date}</p>
        </li>
      ))}
    </ul>
  </div>
);

export default CommunityList;