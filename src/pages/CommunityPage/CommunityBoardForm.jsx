// src/pages/CommunityPage/CommunityBoardForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBoard } from "../../api/boardApi";

function CommunityBoardForm({ currentUser }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 작성자 자동 설정
  const writer = currentUser?.username || "익명";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const newBoard = { title, writer, content };
    setLoading(true);
    setError("");

    try {
      const res = await createBoard(newBoard); // API 호출
      const newPostId = res.data.postId; // 새 글 ID 반환 가정
      alert("게시글이 등록되었습니다!");
      navigate(`/board/community/${newPostId}`); // 상세 페이지 이동
    } catch (err) {
      console.error("게시글 등록 실패:", err);
      setError("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="community-form-page">
      <h2>게시글 작성</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>제목:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>작성자:</label>
          <input type="text" value={writer} readOnly />
        </div>

        <div>
          <label>내용:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "등록 중..." : "등록"}
        </button>
      </form>
    </div>
  );
}

export default CommunityBoardForm;