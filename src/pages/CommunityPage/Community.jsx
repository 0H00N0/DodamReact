// src/pages/CommunityPage/Community.jsx
import React from "react";  //React 기능을 사용하려면 꼭 불러와야 하며, JSX문법을 사용하기 위해 필요함
import { Link } from "react-router-dom"; //다른 페이지로 이동할 때 사용하는 Link라는 기능을 불러오며, 리액트 전용 링크이기 때문에 새로고침 없이 이동함

// 샘플 커뮤니티 게시글 데이터
const posts = [  //게시글들을 담은 배열(목록)을 만들었음
  { id: 1, title: "자기소개 게시판", date: "2025-09-01", content: "여러분 안녕하세요! 자기소개 글입니다." },  //id, 제목(title), 날짜(date), 내용(content)이 담겨 있음
  { id: 2, title: "취미 공유", date: "2025-09-03", content: "저의 취미는 사진 촬영입니다." },
  { id: 3, title: "스터디 모집", date: "2025-09-05", content: "React 스터디 같이 하실 분 모집합니다." }
];

const Community = () => {  //Community라는 함수형 컨포넌트이며, 이 컴포넌트가 화면에 커뮤니티 게시글 목록을 보여줌
  return (  //컴포넌트가 화면에 어떤 내용을 보여줄지 를 나타내며, 이 JSX가 실제로 사용자에게 보이게 될 화면임
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>  {/*안쪽 여백(padding), 최대 너비 제한(maxWidth), 가운데 정렬(margin) 된 전체 화면을 감싸는 박스를 만듬*/}
      <h1>💬 커뮤니티</h1>  {/*커뮤니티 페이지 제목을 크게 보여줌*/}
      <ul style={{ listStyle: "none", padding: 0 }}>  {/*글 목록을 담을 <UI>(리스트) 태그임*/}
        {posts.map((post) => (  //posts 배열 안의 게시글을 하나씩 꺼내서 반복해서 보여주는 부분이며,post는 지금 꺼낸 하나의 게시글을 의미함
          <li key={post.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>  {/*각 게시글을 <li>로 감싸서 보여주고, 아래쪽에 여백을 주고 밑줄을 그어서 게시물끼리 구분되도록 했으며, key={post.id}는 리액트가 각각의 글을 구별할 수 있게 해주는 고유한 식별자임*/}
            {/* 상세 페이지로 이동 */}
            <Link to={`/board/community/${post.id}`} style={{ textDecoration: "none", color: "black" }}>  {/*Link를 사용해서 글 제목에 클릭 기능을 넣었으며, 밑줄을 없애고 글자색을 검정으로 지정함*/}
              <h2>{post.title}</h2>    
            </Link>
            <p style={{ color: "gray", fontSize: "14px" }}>{post.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Community;