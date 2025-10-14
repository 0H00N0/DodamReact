import { api } from "../../utils/api";

// 단건 주문 생성
export async function createRent(pronum) {
  const { data } = await api.post("/rent", { pronum });
  return data;
}

// 내 주문목록 조회
export async function fetchMyRents() {
  const { data } = await api.get("/rent/my");
  return Array.isArray(data) ? data : [];
}
