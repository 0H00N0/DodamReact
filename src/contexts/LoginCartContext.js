import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../utils/api";

export const useLoginCart = () => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const once = useRef(false); // 개발모드(StrictMode) 이중 실행 가드

  const refresh = useCallback(async () => {
    try {
      // 1) 가벼운 로그인 여부 확인
      const { data: me } = await api.get("/oauth/me"); // { login: boolean, sid: ... }
      if (!me?.login) {
        setMember(null);
        return;
      }
      // 2) 실제 프로필 로드
      const { data } = await api.get("/member/me");
      setMember(data);
    } catch (err) {
      const s = err?.status ?? err?.response?.status;
      if (s !== 401 && s !== 403) console.error("refresh failed:", err);
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    refresh();
  }, [refresh]);

  // 로그인/로그아웃 이후 헤더 즉시 갱신
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("auth:changed", handler);
    return () => window.removeEventListener("auth:changed", handler);
  }, [refresh]);

  const logout = useCallback(async () => {
    try { await api.post("/member/logout"); }
    finally {
      setMember(null);
      window.dispatchEvent(new Event("auth:changed"));
    }
  }, []);

  return { isLoggedIn: !!member, member, loading, refresh, logout };
};
