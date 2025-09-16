// src/pages/CommunityPage/CommunityBoardDetail.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

const posts = [
  { id: 1, title: "우리 아이 블록 놀이 후기", author: "맘스타그램", date: "2025-09-08", content: "도담도담 블록으로 아이가 하루 종일 즐겁게 놀았어요!" },
  { id: 2, title: "육아 꿀팁 공유합니다", author: "육아대디", date: "2025-09-06", content: "잠들기 전 동화책 읽어주면 아이가 빨리 잠들더라고요." },
  { id: 3, title: "첫 구매 후기", author: "새댁맘", date: "2025-09-02", content: "빠른 배송에 놀랐고, 제품 퀄리티도 좋습니다." }
];

const CommunityBoardDetail = () => {
  const { postId } = useParams(); // postId 가져오기
  const post = posts.find((p) => p.id === parseInt(postId));

  // 댓글 상태
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  if (!post) return <p>게시글을 찾을 수 없습니다.</p>;

  // 댓글 작성
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const newC = {
      id: Date.now(),
      author: "익명", // 나중에 로그인 연결 가능
      content: newComment,
      createdAt: new Date().toLocaleString(),
    };
    setComments([...comments, newC]);
    setNewComment("");
  };

  // 댓글 수정
  const handleEditComment = (id, content) => {
    setComments(comments.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  // 댓글 삭제
  const handleDeleteComment = (id) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>{post.title}</h1>
      <p style={{ color: "gray", fontSize: "14px" }}>
        {post.author} · {post.date}
      </p>
      <div style={{ marginTop: "20px" }}>
        <p>{post.content}</p>
      </div>

      {/* 댓글 영역 */}
      <div style={{ marginTop: "40px" }}>
        <h3>댓글</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {comments.map((c) => (
            <li
              key={c.id}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "8px 0",
              }}
            >
              <p>
                <b>{c.author}</b>: {c.content}
              </p>
              <small style={{ color: "gray" }}>{c.createdAt}</small>
              <div>
                <button
                  onClick={() => {
                    const content = prompt("댓글을 수정하세요", c.content);
                    if (content) handleEditComment(c.id, content);
                  }}
                  style={{ marginRight: "8px" }}
                >
                  수정
                </button>
                <button onClick={() => handleDeleteComment(c.id)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>

        {/* 댓글 작성창 */}
        <div style={{ marginTop: "10px" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            style={{ width: "70%", marginRight: "10px" }}
          />
          <button onClick={handleAddComment}>작성</button>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Link to="/board/community">⬅ 목록으로 돌아가기</Link>
      </div>
    </div>
  );
};

export default CommunityBoardDetail;