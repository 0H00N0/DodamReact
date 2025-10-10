import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCommunityPost } from "../../api/communityApi"; // ✅ 새로 만든 API 연결

function CommunityWriteForm({ currentUser }) {
  const navigate = useNavigate();

  // 입력 필드 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 로그인 정보 (없으면 익명)
  const writer = currentUser?.nickname || "익명";
  const memberId = currentUser?.id || "guest01";

  // 등록 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // 서버 엔티티 필드에 맞춘 요청 데이터
    const data = {
      mnum: 1,          // 회원 번호 (예시)
      mtnum: 1,         // 회원 유형 번호 (예시)
      bcanum: 1,        // 카테고리 번호 (예시)
      bsnum: 1,         // 게시판 상태 번호 (예시)
      bsub: title,      // 제목
      bcontent: content, // 내용
      mid: memberId,    // 회원 아이디
      mnic: writer,     // 닉네임
    };

    setLoading(true);
    setError("");

    try {
      const res = await createCommunityPost(data);
      console.log("등록 성공:", res);
      alert("게시글이 성공적으로 등록되었습니다!");
      navigate("/board/community/list"); // ✅ 등록 후 리스트로 이동
    } catch (err) {
      console.error("등록 실패:", err);
      setError("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-pink-500 mb-6">
        ✏️ 커뮤니티 글 작성
      </h2>

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* 작성자 */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">작성자</label>
          <input
            type="text"
            value={writer}
            readOnly
            className="p-3 border border-gray-200 rounded-2xl bg-gray-100 text-gray-600"
          />
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="내용을 입력하세요"
            className="p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-300"
          ></textarea>
        </div>

        {/* 등록 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="p-4 bg-pink-500 text-white font-semibold rounded-2xl shadow-md hover:bg-pink-600 transition disabled:opacity-50"
        >
          {loading ? "등록 중..." : "등록하기 💌"}
        </button>
      </form>
    </div>
  );
}

export default CommunityWriteForm;