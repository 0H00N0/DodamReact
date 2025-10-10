// src/api/communityApi.js
import axios from "axios";

const API_URL = "http://localhost:8080/board/community/write";

export const createCommunityPost = async (data) => {
  const response = await axios.post(API_URL, data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};