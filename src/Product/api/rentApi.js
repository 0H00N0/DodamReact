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

// 취소 (배송중만)
export async function cancelRent(renNum) {
  const { data } = await api.post(`/rent/${renNum}/cancel`);
  return data;
}

// 교환 (배송중만)
export async function exchangeRent(renNum, newPronum, reason = "") {
  const { data } = await api.post(`/rent/${renNum}/exchange`, { newPronum, reason });
  return data;
}

// 반품 (배송완료만)
export async function returnRent(renNum, reason = "") {
  const { data } = await api.post(`/rent/${renNum}/return`, { reason });
  return data;
}