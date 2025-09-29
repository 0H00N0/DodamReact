// src/contexts/AuthContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { getWithSession } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // null=게스트, object=로그인 유저
  const [booted, setBooted] = useState(false);
  const bootOnceRef = useRef(false);        // StrictMode 중복 실행 방지

  // ✅ /member/me 응답 정규화: {login:false} => 비로그인, 그 외(회원객체) => 로그인
  const fetchMe = useCallback(async () => {
    try {
      const me = await getWithSession('/member/me');
      if (!me || me.login === false) {
        setUser(null);
      } else {
        setUser(me); // 회원 객체 그대로 저장 (mid, name 등)
      }
    } catch {
      setUser(null);
    }
  }, []);

  // ✅ 앱 최초 진입 시: "로그인 힌트"가 있을 때만 상태 조회
  useEffect(() => {
    if (bootOnceRef.current) return;
    bootOnceRef.current = true;

    (async () => {
      try {
        const hint = sessionStorage.getItem('auth_hint');
        if (hint) {
          await fetchMe();
        } else {
          setUser(null); // 게스트로 시작
        }
      } finally {
        setBooted(true);
      }
    })();
  }, [fetchMe]);

  // ✅ 콜백/로그아웃 등에서 auth:changed 이벤트를 쏘면 상태 재로드
  useEffect(() => {
    const refetch = () => fetchMe();
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
