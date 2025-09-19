// src/pages/CommunityPage/CommunityBoardForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CommunityBoardForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("익명");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!title || !content) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    axios
      .post("/api/boards", { title, author, content })
      .then(() => {
        navigate("/board/community");
      })
      .catch((err) => {
        console.error(err);
        setError("글 작성에 실패했습니다.");
      });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-pink-50 rounded-3xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-pink-600 mb-6">게시글 작성</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-2xl border border-pink-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-pink-300"
          placeholder="제목을 입력해주세요"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">작성자</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full rounded-2xl border border-pink-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-pink-300"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full rounded-2xl border border-pink-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder-pink-300"
          placeholder="내용을 입력해주세요"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-pink-400 text-white py-3 rounded-2xl font-semibold shadow-md hover:bg-pink-500 transition"
      >
        등록
      </button>
    </div>
  );
};

export default CommunityBoardForm;
