// src/pages/CommunityPage/CommunityBoardDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CommunityBoardDetail = ({ currentUser }) => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 1️⃣ 게시글 조회
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/boards/${postId}`);
        setPost(res.data);
        setComments(res.data.comments || []); // 댓글 초기값
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("게시글을 불러오지 못했습니다.");
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  // 2️⃣ 게시글 삭제
  const handleDeletePost = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/api/boards/${postId}`);
        alert("게시글이 삭제되었습니다.");
        navigate("/board/community");
      } catch (err) {
        console.error(err);
        alert("삭제 실패! 다시 시도해주세요.");
      }
    }
  };

  // 3️⃣ 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`/api/boards/${postId}/comments`, {
        content: newComment,
        author: currentUser?.username || "익명",
      });
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      alert("댓글 등록 실패!");
    }
  };

  // 4️⃣ 댓글 수정
  const handleEditComment = async (id) => {
    const content = prompt("댓글을 수정하세요", comments.find(c => c.id === id).content);
    if (!content) return;
    try {
      await axios.put(`/api/boards/${postId}/comments/${id}`, { content });
      setComments(comments.map(c => (c.id === id ? { ...c, content } : c)));
    } catch (err) {
      console.error(err);
      alert("댓글 수정 실패!");
    }
  };

  // 5️⃣ 댓글 삭제
  const handleDeleteComment = async (id) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/boards/${postId}/comments/${id}`);
      setComments(comments.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("댓글 삭제 실패!");
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>게시글이 존재하지 않습니다.</div>;

  const isAuthor = currentUser?.username === post.author;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>{post.title}</h1>
      <p style={{ color: "gray", fontSize: "14px" }}>
        {post.author} · {post.date}
      </p>
      <div style={{ marginTop: "20px" }}>
        <p>{post.content}</p>
      </div>

      {/* 게시글 수정/삭제 버튼 */}
      {isAuthor && (
        <div style={{ marginTop: "20px" }}>
          <Link to={`/board/community/edit/${post.id}`}>
            <button>✏ 글 수정</button>
          </Link>
          <button onClick={handleDeletePost} style={{ marginLeft: "10px" }}>
            🗑 글 삭제
          </button>
        </div>
      )}

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
              {currentUser?.username === c.author && (
                <div>
                  <button onClick={() => handleEditComment(c.id)} style={{ marginRight: "8px" }}>
                    수정
                  </button>
                  <button onClick={() => handleDeleteComment(c.id)}>삭제</button>
                </div>
              )}
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