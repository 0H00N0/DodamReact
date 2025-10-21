import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTopRoute() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 공지/커뮤니티 상세 경로만 상단으로 올림
    const patterns = [
      /^\/board\/\d+$/,          // 예: /board/38
      /^\/board\/[^/]+\/\d+$/,   // 예: /board/notice/38
      /^\/community\/\d+$/,      // 예: /community/12
    ];
    const shouldScroll = patterns.some((rx) => rx.test(pathname));
    if (shouldScroll) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  return null;
}
