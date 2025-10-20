// src/api/communityApi.js
import axios from "axios";

const API_URL = "http://localhost:8080/board/community/write";

// BoardEntity 컬럼명에 맞게 수정
export const createCommunityPost = async (data) => {
  const response = await axios.post(API_URL, {
    bsub: data.bsub,         // 제목
    bcontent: data.bcontent, // 내용
    mnic: data.mnic,         // 작성자
  }, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};