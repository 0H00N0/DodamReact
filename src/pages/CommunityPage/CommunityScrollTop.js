// src/hooks/CommunityScrollTop.js
import { useEffect } from "react";

/**
 * ✅ 페이지 진입 시 자동으로 스크롤을 맨 위로 이동시키는 공통 훅
 *
 * @param {boolean} [smooth=false] - true로 하면 부드럽게 스크롤됨
 */
export function useScrollTopOnMount(smooth = false) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? "smooth" : "instant",
    });
  }, []);
}
