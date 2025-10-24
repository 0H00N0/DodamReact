// src/pages/CommunityPage/CommunityBoard.jsx
import React from "react";  //React를 사용하기 위해 react 라이브러리에서 기본 객체를 가져옴

import { Link } from "react-router-dom";  //Link라는 기능을 react-router-dom 라이브러리에서 가져옴 
import axios from "axios";  //서버랑 통신을 할 수 있게 해주는 axios 라잊브러리를 가져왔지만, 지금은 사용하고 있지 않음

const posts = [  //게시물들을 미리 배열로 만들아놓고, 그걸 화면에 보여줄 것임
  { id: 1, title: "우리 아이 블록 놀이 후기", author: "맘스타그램", date: "2025-09-08", content: "도담도담 블록으로 아이가 하루 종일 즐겁게 놀았어요!" },  //첫 번쨰 게시물이며, 제목, 작성자, 날짜, 내용이 담겨 있음
  { id: 2, title: "육아 꿀팁 공유합니다", author: "육아대디", date: "2025-09-06", content: "잠들기 전 동화책 읽어주면 아이가 빨리 잠들더라고요." },
  { id: 3, title: "첫 구매 후기", author: "새댁맘", date: "2025-09-02", content: "빠른 배송에 놀랐고, 제품 퀄리티도 좋습니다." }
];

const CommunityBoard = () => {  //CommunityBoard라는 컴포넌트를 만들고, 이게 게시판 페이지임
  return (  // 이 컴포넌트가 실제로 보여줄 화면을 아래에 적기 시작함
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}> {/*안쪽 여백 20px로 하고, 최대 900px 넓어질 수 있고, 위아래 여백은 0px로 좌우 여백은 자동(가운데 정렬)으로 설정함*/}
      <h1>💬 커뮤니티 게시판</h1>  {/*큰 제목을 보여줌*/}

      {/* 작성 버튼 */}
      <div style={{ textAlign: "right", marginBottom: "10px" }}>  {/*글쓰기 버튼을 감싸는 박스이며, 버튼을 오른쪽으로 정렬하고, 아래에 10px의 여백을 줘서 간격을 줌*/}
        <Link to="/board/community/write">  {/*링크 버튼을 클릭하면 저 경로로 이동하게 만들어주는 Link 컴포넌트임(페이지 전체 새로고침 없이 부드럽게 이동함)*/}
          <button>✍ 글 작성</button>  {/*실제로 사용자에게 보이는 버튼이며, 클릭하면 위의 Link 덕분에 글쓰기 페이지로 이동함*/}
        </Link>  {/*Link 태그 닫기임*/}
      </div>  {/*버튼을 감싸던 박스를 닫음*/}

      <ul style={{ listStyle: "none", padding: 0 }}>  {/*게시글 목록 전체를 감싸는 UI 리스트이며, listStyle: "none"을 사용해서 리스트 앞에 붙는 ●점을 없애고 padding: 0으로 기본 안쪽 여백(상,하,좌,우)을 없앰 */}
        {posts.map((post) => (  ////posts 배열을 .map() 함수를 사용해 하나씩 돌면서 각 게시글 하나하나를 화면에 보여줄 JSX로 바꿔서 출력함
          <li key={post.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>  {/*각 게시글을 담는 li(목록 항목 하나)요소로, 전에 있었던 것인지 아닌지를 알기 위해서 key={post.id}가 필요하며, 각 게시글 사이에 20px 바깥 여백을 주고, 아래쪽에 연한 회색 실선 구분선을 넣으며, 아래쪽 안쪽 여백 10px(글자와 밑줄 사이 띄움)*/}
            {/* 상세 페이지로 이동 */}
            <Link to={`/board/community/${post.id}`} style={{ textDecoration: "none", color: "black" }}>  {/*게시글 제목을 클릭하면 해당 게시글의 상세 페이지로 이동하며, 스타일은 밑줄을 제거하고, 글자 색을 검정색으로 설정함*/}
              <h2>{post.title}</h2>  {/*게시글의 제목을 <h2>로 표시하며, 제목을 클릭하면 위의 Link 덕분에 상세 페이지로 이동함*/}
            </Link>  {/*제목 링크 닫기임*/}
            <p style={{ fontSize: "14px", color: "gray" }}>  {/* 글자 크기를 14px로, 색상을 회색으로 지정함*/}
              {post.author} · {post.date}  {/*게시글의 작성자와 작성일을 함께 표시함*/}
            </p>
          </li> //각 게시물 항목(li)을 닫음
        ))}  {/*map 반복을 종료함*/}
      </ul>
    </div>
  );
};  //CommunityBoard 컨포넌트 정의를 마침

export default CommunityBoard;  //CommunityBoard 컴포넌트를 다른 파일에서 불러와 사용할 수 있게 모듈(파일)로 내보냄