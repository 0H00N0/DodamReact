// src/pages/CommunityPage/Community.js
import React from "react";  //React 라이브러리를 가져옴

const Community = () => {  //Coummunity라는 함수형 컨포넌트를 선언함(이 컴포넌트는 나중에 화면에 커뮤니티 게시글 목록을 보여줄 것임)
  const posts = [  //posts는 게시글을 여러 개 담고 있는 배열임
    { id: 1, title: "우리 아이 블록 놀이 후기", author: "맘스타그램", date: "2025-09-08", content: "도담도담 블록으로 아이가 하루 종일 즐겁게 놀았어요!" },  //첫 번째 게시물이며 글 번호(id), 제목(title), 작성자(author), 날짜(date), 내용(content)이 있음
    { id: 2, title: "육아 꿀팁 공유합니다", author: "육아대디", date: "2025-09-06", content: "잠들기 전 동화책 읽어주면 아이가 빨리 잠들더라고요." },  //두 번째 게시물
    { id: 3, title: "첫 구매 후기", author: "새댁맘", date: "2025-09-02", content: "빠른 배송에 놀랐고, 제품 퀄리티도 좋습니다." }   // 세 번째 게시물이며, 여기서 배열이 끝남 
  ];

  return (  //이제 이 컴포넌트가 화면에 무엇을 보여줄지를 나타냄
    <div style={{ padding: "20px" }}>  {/*div는 화면 전체를 감싸는 박스이며, 안쪽에 20px만큼 여백을 줌*/}
      <h1>💬 커뮤니티</h1>  {/*<h1>은 제일 큰 제목 태그이며, 화면에 크게 커뮤니티라는 제목을 보여줌*/}
      <ul>  {/*여러 개의 게시글을 감싸는 리스트 시작 부분임*/}
        {posts.map((post) => (  //posts는 배열 안의 글들을 하나씩 꺼내서 보여주는 반복문이며, post는 꺼낸 하나의 게시글을 의미함
          <li key={post.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>  {/*게시글 하나를 <li> 태그로 만들어 보여주며, key={post.id}는 리액트가 각 게시글을 구분할 수 있게 해주는 고유 번호이고, 아래쪽에는 여백(15px)과 밑줄(border), 안쪽 여백(10px)을 주어 구분이 잘 되도록 함*/}
            <h2>{post.title}</h2>  {/*<h2>는 중간 크기 제목이며, 글 제목을 보여줌*/}
            <p style={{ fontSize: "14px", color: "gray" }}>  {/*회색 글씨 14px로 보여줌*/}
              {post.author} · {post.date}  {/*작성자 이름과 날짜*/}
            </p>
            <p>{post.content}</p>  {/*게시글 본문 내용을 보여줌*/}
          </li>
        ))}  {/*여기까지 한 게시글을 보여주는 코드이며, 이걸 posts 배열 안의 모든 글에 대해 반복해서 보여줌*/}
      </ul>
    </div> 
  );  //전체 게시글 목록(UI)과 바깥 박스(div)를 닫아줌
};   //Community 컴포넌트 함수가 끝남

export default Community;  //이 Community 컴포넌트를 다른 파일에서 사용할 수 있게 내보내는 거임