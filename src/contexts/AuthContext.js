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
      const me = await getWithSession('/oauth/me');
      if (!me || me.login === false) {
        setUser(null);
      } else {
        // ✅ 정규화해서 저장 (UI는 user.name, user.mid만 보면 됨)
        setUser({
          isAuthenticated: true,
          mid: me.sid || '',
          // name: me.name || '',     // 유지(다른 화면 대비)
          mname: me.name || '',    // ✅ 드롭다운 호환용으로 채워줌
          email: me.email || '',
        });
      }
    } catch {
      setUser(null);
    }
  }, []);

  // ✅ 앱 최초 진입 시: 무조건 /oauth/me 조회
  useEffect(() => {
    if (bootOnceRef.current) return;
    bootOnceRef.current = true;

    (async () => {
      try {
        await fetchMe();          // <— 힌트 체크 없이 항상 호출
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
