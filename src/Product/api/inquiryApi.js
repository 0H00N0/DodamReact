import { api } from "../../utils/api";

// 주문상품 문의 등록
export async function createProductInquiry({ pronum, renNum, title, content }) {
  const { data } = await api.post("/product-inquiries", { pronum, renNum, title, content });
  return data;
}

// 내 주문상품 문의 목록
export async function fetchMyProductInquiries() {
  const { data } = await api.get("/product-inquiries/my");
  return Array.isArray(data) ? data : [];
}
