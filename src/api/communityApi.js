// src/api/communityApi.js
import axios from "axios";

const API_URL = "http://localhost:8080/board/community/write";

// BoardEntity 컬럼명에 맞게 수정
/* export const createCommunityPost = async (data) => {
  const response = await axios.post(API_URL,)  {
    bsub: data.bsub,         // 제목
    bcontent: data.bcontent, // 내용
    mnic: data.mnic,         // 작성자
  }}, 
  {
    headers: { "Content-Type": "application/json" }
  };
  return response.data; */

// 커뮤니티 게시글 등록 API
export const createCommunityPost = async (data) => {
  try {
    const response = await axios.post("/api/community", data);
    return response.data; // 성공 시 서버 응답 데이터 반환
  } catch (error) {
    // 에러 콘솔 출력 및 다시 던지기
    console.error("API 요청 실패:", error);
    throw error;
  }
};