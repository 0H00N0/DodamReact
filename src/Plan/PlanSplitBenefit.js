// 플랜 설명 노트에서 혜택 목록과 설명 분리
// - 불릿 기호: '-', '*', '•' (앞뒤 공백 무시)
// - 줄바꿈: '\n', '\r\n'
// - 불릿이 아닌 문장은 설명으로 간주
// - 불릿이 문장 중간에 있으면 줄바꿈으로 간주
// - 반환값: { desc: "설명", items: ["혜택1", "혜택2", ...] }
export function splitBenefit(note) {
  if (!note) return { desc: "", items: [] };

  // 1) 줄바꿈/불릿 정규화
  const normalized = note
    .replaceAll("\r\n", "\n")
    .replace(/•/g, "- ")     // '•'도 불릿으로 쓰였으면 대체
    .replace(/ - /g, "\n- "); // 문장 중간 ' - ' → 줄바꿈 불릿

  // 2) 줄 단위로 쪼개고 불필요한 공백 제거
  const lines = normalized
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  // 3) 분류
  const items = [];
  const descParts = [];
  for (const line of lines) {
    if (/^(-|\*)\s+/.test(line)) {
      items.push(line.replace(/^(-|\*)\s+/, "")); // 불릿 기호 제거
    } else {
      descParts.push(line);
    }
  }

  return {
    desc: descParts.join(" "), // 설명은 문장 이어 붙이기
    items,                     // 포함 혜택 목록
  };
}
