// src/api/boardApi.js
import axios from "axios";

const API_URL = "http://localhost:8080/board/community/write";

// 게시글 작성
export const createBoard = async ({
  mnum,       // 회원번호 (필수)
  mtnum,      // 작성자 유형 번호
  bcanum,     // 카테고리 번호
  bsnum,      // 게시판 상태 번호
  bsub,       // 제목
  bcontent,   // 내용
  mid,        // 회원 ID
  mnic        // 작성자 닉네임
}) => {
  const response = await axios.post(API_URL, {
    mnum,
    mtnum,
    bcanum,
    bsnum,
    bsub,
    bcontent,
    mid,
    mnic
  });
  return response.data;
};