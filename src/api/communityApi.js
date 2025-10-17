// /src/api/communityApi.js
import axios from "axios";

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