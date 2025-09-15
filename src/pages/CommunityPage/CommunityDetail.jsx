// src/pages/CommunityPage/CommunityDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

// 샘플 커뮤니티 게시글 데이터 (Community.jsx와 동일)
const posts = [
  { id: 1, title: "자기소개 게시판", date: "2025-09-01", content: "여러분 안녕하세요! 자기소개 글입니다." },
  { id: 2, title: "취미 공유", date: "2025-09-03", content: "저의 취미는 사진 촬영입니다." },
  { id: 3, title: "스터디 모집", date: "2025-09-05", content: "React 스터디 같이 하실 분 모집합니다." }
];

const CommunityDetail = () => {
  const { id } = useParams(); // URL에서 id 가져오기
  const post = posts.find((p) => p.id === parseInt(id));

  if (!post) {
    return <p>게시글을 찾을 수 없습니다.</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>{post.title}</h1>
      <p style={{ color: "gray", fontSize: "14px" }}>{post.date}</p>
      <div style={{ marginTop: "20px" }}>
        <p>{post.content}</p>
      </div>
      <div style={{ marginTop: "20px" }}>
        <Link to="/board/community">⬅ 목록으로 돌아가기</Link>
      </div>
    </div>
  );
};

export default CommunityDetail;