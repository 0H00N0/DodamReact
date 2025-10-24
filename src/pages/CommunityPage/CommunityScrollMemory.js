// src/hooks/useScrollMemory.js
import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * 스크롤 메모리 훅
 *
 * - 페이지 진입 시: push/replace 네비게이션이면 top으로, pop(뒤로가기)이면 저장된 위치로 복원
 * - 페이지 체류 중: 스크롤 위치를 세션스토리지에 계속 저장(디바운스)
 *
 * @param {object} options
 * @param {boolean} [options.scrollTopOnMount=true]  - 진입 시 top(뒤로가기는 복원 우선)
 * @param {"auto"|"smooth"} [options.behavior="auto"] - 스크롤 이동 방식
 * @param {boolean} [options.persistSearch=true]     - 경로키에 쿼리스트링 포함 여부
 * @param {number}  [options.debounce=120]           - 스크롤 저장 디바운스(ms)
 */
export function useScrollMemory(options = {}) {
  const {
    scrollTopOnMount = true,
    behavior = "auto",
    persistSearch = true,
    debounce = 120,
  } = options;

  const { pathname, search } = useLocation();
  const navType = useNavigationType(); // "POP" | "PUSH" | "REPLACE"
  const key = `__scroll:${pathname}${persistSearch ? search : ""}`;
  const rafRef = useRef(0);
  const timerRef = useRef(0);
  const lastSavedRef = useRef(0);

  // 스크롤 위치 저장(디바운스)
  useEffect(() => {
    function save() {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      lastSavedRef.current = y;
      sessionStorage.setItem(key, String(y));
    }

    function onScroll() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(save, debounce);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // 최초에도 한 번 저장(0으로 시작하더라도)
    save();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
      // 언마운트 시 마지막 위치 한 번 더 저장
      save();
    };
    // key가 바뀌면 새 경로에 대해 새로 바인딩
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, debounce]);

  // 진입 시 스크롤 복원/초기화
  useEffect(() => {
    // 레이아웃/이미지 로딩 후까지 몇 번 시도하여 안정적으로 복원
    const MAX_TRIES = 10;
    let tries = 0;

    function scrollTo(y) {
      window.scrollTo({ top: y, left: 0, behavior });
    }

    function restoreWithRetries(targetY) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const tick = () => {
        tries += 1;
        // 문서 높이가 충분히 늘어났는지 확인 후 복원
        const docHeight =
          Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
          ) || 0;

        if (docHeight >= targetY || tries >= MAX_TRIES) {
          scrollTo(targetY);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    // POP(뒤로/앞으로) 네비게이션이면 저장된 위치 복원
    if (navType === "POP") {
      const saved = Number(sessionStorage.getItem(key) || 0);
      restoreWithRetries(isFinite(saved) ? saved : 0);
      return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    }

    // PUSH/REPLACE면 설정에 따라 top으로
    if (scrollTopOnMount) {
      scrollTo(0);
    }

    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // pathname/search/navType이 바뀔 때 동작
  }, [key, navType, behavior, scrollTopOnMount]);
}
