// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getWithSession } from 'utils/api';   // 경로 규칙에 맞춰 import (상대/절대 중 프로젝트 규약대로)

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);

  // 공통으로 쓰는 me 호출 함수
  const fetchMe = useCallback(async () => {
    try {
      // 너희 서버 구현에 맞게 /member/me 또는 /oauth/me 사용
      const me = await getWithSession('/member/me'); 
      // 또는: const me = await getWithSession('/oauth/me'); // { login:true, sid:... }
      setUser(me?.mid ? me : { mid: me?.sid }); // 반환 형태에 맞춰 저장
    } catch {
      setUser(null);
    } finally {
      setBooted(true);
    }
  }, []);

  // 앱 최초 진입 시 현재 로그인 상태 로드
  useEffect(() => { fetchMe(); }, [fetchMe]);

  // ✅ 여기! 콜백/로그아웃 등에서 auth:changed 이벤트를 쏘면 상태를 다시 로드
  useEffect(() => {
    const refetch = () => { fetchMe(); };
    window.addEventListener('auth:changed', refetch);
    return () => window.removeEventListener('auth:changed', refetch);
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, setUser, refresh: fetchMe, booted }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
