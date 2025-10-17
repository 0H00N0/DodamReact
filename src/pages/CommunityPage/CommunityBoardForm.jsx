// src/pages/CommunityBoardForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCommunityPost } from "../../api/communityApi";

function CommunityBoardForm({ currentUser }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 작성자 자동 설정: 로그인 유저가 없으면 '익명'
  const writer = currentUser?.username || "익명";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // ✅ 서버 엔티티 필드명과 정확히 맞춤
    const newBoard = {
      title: title,
      content: content,
      writer: writer,
    };

    setLoading(true);
    setError("");

    try {
      const res = await createCommunityPost(newBoard);
      console.log("서버 응답:", res);

      // 엔티티에서 id 필드 기준
      const newPostId = res.id;

      alert("게시글이 등록되었습니다!");
      navigate(`/board/community/${newPostId}`);
    } catch (err) {
      console.error("게시글 등록 실패:", err);
      if (err.response) {
        console.error("응답 상태코드:", err.response.status);
        console.error("응답 데이터:", err.response.data);
      } else {
        console.error("서버 응답 없음:", err.message);
      }
      setError("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-pink-500 mb-6">
        ✏️ 게시글 작성
      </h2>

      {error && (
        <p className="mb-4 text-center text-red-500 font-medium">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-medium">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* 작성자 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-medium">작성자</label>
          <input
            type="text"
            value={writer}
            readOnly
            className="p-4 rounded-2xl border border-gray-200 bg-gray-100 text-gray-600"
          />
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-medium">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
            className="p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* 등록 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="p-4 bg-white text-black font-semibold rounded-2xl border-4 border-black shadow-md hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "등록 중..." : (
            <>
              <span>등록하기</span>
              <span>💌</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CommunityBoardForm;