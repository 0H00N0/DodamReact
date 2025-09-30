// utils/dateFormatter.js
export function formatDate(value) {
  if (!value) return "";

  // LocalDateTime 배열: [year,month,day,hour,minute,second,...]
  if (Array.isArray(value)) {
    const [year, month, day, hour, minute, second] = value;
    return new Date(year, month - 1, day, hour, minute, second).toLocaleString("ko-KR");
  }

  // Epoch timestamp(Long)
  if (typeof value === "number") {
    return new Date(value).toLocaleString("ko-KR");
  }

  // 혹시 문자열이면 바로 Date로 파싱
  if (typeof value === "string") {
    return new Date(value).toLocaleString("ko-KR");
  }

  return "";
}