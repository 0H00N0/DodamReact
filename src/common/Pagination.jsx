import React from "react";
import styles from "./Pagination.module.css";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function Pagination({ page, totalPages, onChange, className }) {
  if (!Number.isFinite(totalPages) || totalPages <= 1) return null;

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;
  const go = (p) => { if (p >= 0 && p < totalPages) onChange?.(p); };

  return (
    <div className={cx(styles.container, className)}>
      <button
        className={styles.btn}
        disabled={!canPrev}
        onClick={() => go(page - 1)}
        aria-label="이전 페이지"
      >
        이전
      </button>

      <span className={styles.label}>
        {page + 1} / {totalPages}
      </span>

      <button
        className={styles.btn}
        disabled={!canNext}
        onClick={() => go(page + 1)}
        aria-label="다음 페이지"
      >
        다음
      </button>
    </div>
  );
}
