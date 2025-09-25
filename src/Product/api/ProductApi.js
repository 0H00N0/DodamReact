import axios from "axios";
import { API_BASE_URL } from "../../utils/api"; // 같은 도메인/프록시면 ""(빈값)로 두면 됨

export async function fetchProducts(params = {}) {
  const query = {
    page: params.page,
    size: params.size,
    // sort 파라미터를 pronum으로 맞춤
    sort: params.sort ? params.sort.replace("productId", "pronum") : "pronum,desc",
    q: params.keyword,
    catenum: params.categoryId,
    prosnum: params.status,
    prograde: params.prograde,
  };

  Object.keys(query).forEach(
    (key) => (query[key] === undefined || query[key] === null || query[key] === "") && delete query[key]
  );

  const { data } = await axios.get(`${API_BASE_URL}/products`, { params: query });
  return data;
}

export async function fetchProductById(id) {
  const { data } = await axios.get(`${API_BASE_URL}/products/${id}`);
  return data; // ProductResponseDto
}