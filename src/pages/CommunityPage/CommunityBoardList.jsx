// src/pages/CommunityPage/CommunityBoardList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CommunityBoardList = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  // ✅ 백엔드에서 목록 가져오기
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/boards") // Spring Boot API
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.error("게시글 목록 불러오기 실패:", err);
      });
  }, []);

  // 삭제 기능
  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .delete(`http://localhost:8080/api/boards/${id}`)
        .then(() => {
          setPosts(posts.filter((post) => post.id !== id));
        })
        .catch((err) => {
          console.error("삭제 실패:", err);
        });
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
        {posts.length === 0 ? (
          <p>등록된 게시글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <li
              key={post.id}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "10px 0",
              }}
            >
              {/* 제목 클릭 → 상세 페이지 */}
              <Link
                to={`/board/community/${post.id}`}
                style={{ textDecoration: "none", color: "black" }}
              >
                <b>{post.title}</b>
              </Link>
              <span
                style={{
                  color: "gray",
                  fontSize: "14px",
                  marginLeft: "10px",
                }}
              >
                {post.writer} · {post.createdDate || "날짜 없음"}
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
          ))
        )}
      </ul>
    </div>
  );
};

export default CommunityBoardList;