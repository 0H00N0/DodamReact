import axios from "axios";
import { API_BASE_URL } from "../../utils/api"; // 같은 도메인/프록시면 ""(빈값)로 두면 됨

export async function fetchProducts(params = {}) {
  const {
    keyword, categoryId, status,
    ...rest
  } = params;
  return axios.get(`${API_BASE_URL}/api/productsPage`, {
    params: {
      q: keyword,
      catenum: categoryId,
      prograde: status,
      ...rest
    }
  });
}// Spring Page: { content, number, size, totalElements, totalPages, ... }

export async function fetchProductById(id) {
  const { data } = await axios.get(`${API_BASE_URL}/products/${id}`);
  return data; // ProductResponseDto
}
