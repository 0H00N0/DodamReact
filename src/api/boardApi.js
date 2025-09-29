// src/api/boardApi.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/boards";

// 게시글 작성
export const createBoard = async ({ title, content, writer }) => {
  const response = await axios.post(API_URL, {
    title,
    content,
    writer   // ✅ Board2Entity 필드명에 맞춤
  });
  return response.data;
};