// src/pages/CommunityPage/CommunityBoardDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

const posts = [
  { id: 1, title: "우리 아이 블록 놀이 후기", author: "맘스타그램", date: "2025-09-08", content: "도담도담 블록으로 아이가 하루 종일 즐겁게 놀았어요!" },
  { id: 2, title: "육아 꿀팁 공유합니다", author: "육아대디", date: "2025-09-06", content: "잠들기 전 동화책 읽어주면 아이가 빨리 잠들더라고요." },
  { id: 3, title: "첫 구매 후기", author: "새댁맘", date: "2025-09-02", content: "빠른 배송에 놀랐고, 제품 퀄리티도 좋습니다." }
];

const CommunityBoardDetail = () => {
  const { postId } = useParams(); // postId 가져오기
  const post = posts.find((p) => p.id === parseInt(postId));

  if (!post) return <p>게시글을 찾을 수 없습니다.</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>{post.title}</h1>
      <p style={{ color: "gray", fontSize: "14px" }}>
        {post.author} · {post.date}
      </p>
      <div style={{ marginTop: "20px" }}>
        <p>{post.content}</p>
      </div>
      <div style={{ marginTop: "20px" }}>
        <Link to="/board/community">⬅ 목록으로 돌아가기</Link>
      </div>
    </div>
  );
};

export default CommunityBoardDetail;