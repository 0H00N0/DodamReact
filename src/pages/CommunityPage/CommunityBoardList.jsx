// src/pages/CommunityPage/CommunityBoardList.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const initialPosts = [
  { id: 1, title: "우리 아이 블록 놀이 후기", author: "맘스타그램", date: "2025-09-08" },
  { id: 2, title: "육아 꿀팁 공유합니다", author: "육아대디", date: "2025-09-06" },
  { id: 3, title: "첫 구매 후기", author: "새댁맘", date: "2025-09-02" },
];

const CommunityBoardList = () => {
  const [posts, setPosts] = useState(initialPosts);
  const navigate = useNavigate();

  // 삭제 기능
  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setPosts(posts.filter((post) => post.id !== id));
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>커뮤니티 게시판</h1>

      {/* ✅ 작성 버튼 */}
      <div style={{ textAlign: "right", marginBottom: "20px" }}>
        <Link to="/board/community/write">
          <button style={{ padding: "6px 12px" }}>✏ 글 작성</button>
        </Link>
      </div>

      {/* 게시글 목록 */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {posts.map((post) => (
          <li
            key={post.id}
            style={{
              borderBottom: "1px solid #ddd",
              padding: "10px 0",
            }}
          >
            {/* 제목 클릭 → 상세 페이지 */}
            <Link to={`/board/community/${post.id}`} style={{ textDecoration: "none", color: "black" }}>
              <b>{post.title}</b>
            </Link>
            <span style={{ color: "gray", fontSize: "14px", marginLeft: "10px" }}>
              {post.author} · {post.date}
            </span>

            {/* ✅ 수정 / 삭제 버튼 */}
            <div style={{ marginTop: "5px" }}>
              <button
                onClick={() => navigate(`/board/community/edit/${post.id}`)}
                style={{ marginRight: "5px" }}
              >
                수정
              </button>
              <button onClick={() => handleDelete(post.id)}>삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityBoardList;