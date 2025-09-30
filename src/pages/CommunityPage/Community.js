// src/pages/CommunityPage/Community.js
import React from "react";

const Community = () => {
  const posts = [
    { id: 1, title: "우리 아이 블록 놀이 후기", author: "맘스타그램", date: "2025-09-08", content: "도담도담 블록으로 아이가 하루 종일 즐겁게 놀았어요!" },
    { id: 2, title: "육아 꿀팁 공유합니다", author: "육아대디", date: "2025-09-06", content: "잠들기 전 동화책 읽어주면 아이가 빨리 잠들더라고요." },
    { id: 3, title: "첫 구매 후기", author: "새댁맘", date: "2025-09-02", content: "빠른 배송에 놀랐고, 제품 퀄리티도 좋습니다." }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>💬 커뮤니티</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
            <h2>{post.title}</h2>
            <p style={{ fontSize: "14px", color: "gray" }}>
              {post.author} · {post.date}
            </p>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Community;