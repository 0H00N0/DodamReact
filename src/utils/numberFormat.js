// src/utils/numberFormat.js
export const fmtKRW = (num) =>
  Number(num ?? 0).toLocaleString("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 });

export const fmtInt = (num) =>
  Number(num ?? 0).toLocaleString("ko-KR", { maximumFractionDigits: 0 }); // 정수표시(.00 제거)
