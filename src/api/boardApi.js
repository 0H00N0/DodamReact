// src/api/boardApi.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/boards";

// 게시글 작성
export const createBoard = async (board) => {
  const response = await axios.post(API_URL, board);
  return response.data;
};