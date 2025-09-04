import React from "react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;
  const go = (p) => { if (p >= 0 && p < totalPages) onChange?.(p); };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button className="px-3 py-1 rounded border disabled:opacity-50" disabled={!canPrev} onClick={() => go(page - 1)}>이전</button>
      <span className="text-sm">{page + 1} / {totalPages}</span>
      <button className="px-3 py-1 rounded border disabled:opacity-50" disabled={!canNext} onClick={() => go(page + 1)}>다음</button>
    </div>
  );
}
