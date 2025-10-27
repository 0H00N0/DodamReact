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

  // ✅ /oauth/me 응답 정규화
  const fetchMe = useCallback(async () => {
    try {
      const me = await getWithSession('/oauth/me');
      if (!me || me.login === false) {
        setUser(null);
      } else {
        // ✅ 여기서 mnum 포함하도록 수정
        setUser({
          isAuthenticated: true,
          mid: me.sid || me.mid || '',
          mnum: Number(me.mnum) || 0,     // ✅ 추가 (NaN 방지)
          mname: me.name || me.mname || '',
          email: me.email || '',
          role: me.role || 'ROLE_USER',
        });

        // ✅ sessionStorage에도 저장해서 새로고침 유지
        sessionStorage.setItem('user', JSON.stringify({
          isAuthenticated: true,
          mid: me.sid || me.mid || '',
          mnum: Number(me.mnum) || 0,
          mname: me.name || me.mname || '',
          email: me.email || '',
          role: me.role || 'ROLE_USER',
        }));
      }
    } catch (err) {
      console.error('AuthContext: fetchMe 오류', err);
      setUser(null);
    }
  }, []);

  // ✅ 앱 최초 진입 시: 무조건 /oauth/me 조회
  useEffect(() => {
    if (bootOnceRef.current) return;
    bootOnceRef.current = true;

    (async () => {
      try {
        await fetchMe();
      } finally {
        setBooted(true);
      }
    })();
  }, [fetchMe]);

  // ✅ 로그인/로그아웃 이벤트 시 재로딩
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