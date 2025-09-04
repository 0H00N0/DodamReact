import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

export const useLoginCart = () => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/member/me");   // ★ 세션 확인
      setMember(data);
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 로그인/로그아웃 시 헤더가 즉시 갱신되도록 이벤트 구독
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("auth:changed", handler);
    return () => window.removeEventListener("auth:changed", handler);
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.post("/member/logout");
    setMember(null);
    window.dispatchEvent(new Event("auth:changed"));
  }, []);

  return { isLoggedIn: !!member, member, loading, refresh, logout };
};
