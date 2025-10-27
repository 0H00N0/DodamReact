// src/utils/address.js
export function splitAddress(maddr = "") {
  const s = (maddr || "").trim();
  if (!s) return { base: "", detail: "" };

  // 1) 괄호로 부가항목이 붙은 경우: "도로명주소 (OO아파트 101동 1001호)" 형태
  const m1 = s.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (m1) return { base: m1[1].trim(), detail: m1[2].trim() };

  // 2) 동/층/호 등 상세 패턴이 뒤에 붙은 경우를 탐색
  //   - 예: "경기 성남시 분당구 대왕판교로 477 101동 1001호"
  const tokens = s.split(/\s+/);
  const idx = tokens.findIndex((t, i) => {
    // 뒤쪽에서 상세가 시작되는 시그널을 발견하면 그 앞을 base, 뒤를 detail로
    return /(동|층|호|호수|호실|번지|지하|지상|상가|아파트|빌라|타워|오피스텔)/.test(t);
  });

  if (idx > 0) {
    const base = tokens.slice(0, idx).join(" ").trim();
    const detail = tokens.slice(idx).join(" ").trim();
    if (base && detail) return { base, detail };
  }

  // 3) 하이픈 번지/호수 뒤에 상세가 이어지는 케이스 추정
  const m3 = s.match(/^(.+\d(?:-\d+)?)(.+)$/);
  if (m3) {
    const base = m3[1].trim();
    const detail = m3[2].trim();
    if (base && detail) return { base, detail };
  }

  // 실패하면 전체를 기본주소로 간주
  return { base: s, detail: "" };
}
