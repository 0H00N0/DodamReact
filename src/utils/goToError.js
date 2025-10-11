// src/utils/goToError.js
//api 또는 기타 비동기 작업 중 에러 발생 시 에러 페이지로 이동하는 유틸 함수
export function goToError(navigate, { code = 500, reason = "서버 오류", detail = "" } = {}) {
  navigate("/error", { state: { code, reason, detail } });
}
