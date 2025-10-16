// src/utils/shipStatusLable.js
/**
 * 배송 상태(백엔드 enum/문자열)를 화면용 한글로 변환
 * - 대소문자 혼합, null/undefined 모두 안전하게 처리
 * - 모르는 값은 원문을 그대로 보여주되, 필요 시 '상태미정' 등으로 바꿔도 됨
 */
export function shipStatusLabel(status) {
  if (!status) return '상태미정';
  const s = String(status).trim().toUpperCase();
  switch (s) {
    case 'SHIPPING':
      return '배송중';
    case 'DELIVERED':
      return '배송완료';
    default:
      return status; // 혹시 추가 상태가 생겨도 원문 그대로 노출(안전)
  }
}
