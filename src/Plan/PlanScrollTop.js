import { useEffect } from "react";

/**
 * 페이지 진입 시 스크롤을 최상단으로 이동
 * @param {Object} options
 * @param {'auto' | 'smooth'} options.behavior - 스크롤 애니메이션 (기본값 'auto')
 * @param {string} options.selector - 특정 스크롤 컨테이너 CSS 선택자 (기본값 window)
 */
export function useScrollTop({ behavior = "auto", selector } = {}) {
  useEffect(() => {
    if (selector) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollTo({ top: 0, left: 0, behavior });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [behavior, selector]);
}