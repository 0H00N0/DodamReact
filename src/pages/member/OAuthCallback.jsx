// src/pages/member/OAuthCallback.jsx
import React, { useEffect, useRef, useState } from 'react';
import { postWithSession } from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function OAuthCallback() {
  const { provider } = useParams();
  const p = (provider || '').toLowerCase();   // 'kakao' | 'naver'
  const navigate = useNavigate();
  const [msg, setMsg] = useState('로그인 처리 중...');
  const onceRef = useRef(false);

  useEffect(() => {
    if (onceRef.current) return;
    onceRef.current = true;

    (async () => {
      try {
        // 1) 쿼리 우선, 없으면 해시
        const raw =
          window.location.search.startsWith('?')
            ? window.location.search.substring(1)
            : window.location.hash.startsWith('#')
              ? window.location.hash.substring(1)
              : '';
        const qs = new URLSearchParams(raw);

        // 2) 주소창 정리 (중복 실행/재시도시 파라미터 잔존 방지)
        window.history.replaceState(null, '', `/oauth/callback/${p}`);

        // 3) 에러 처리
        const error = qs.get('error') || qs.get('error_description');
        if (error) {
          setMsg('사용자가 취소했거나 권한이 거부되었습니다.');
          setTimeout(() => navigate('/login', { replace: true }), 800);
          return;
        }

        // 4) 파라미터 추출
        const token = qs.get('access_token'); // implicit
        const code  = qs.get('code');         // authorization code
        const state = qs.get('state') || undefined;

        if (!token && !code) {
          setMsg('인증 응답이 비어 있습니다.');
          setTimeout(() => navigate('/login', { replace: true }), 800);
          return;
        }

        // 5) 백엔드로 전달
        const payload = token ? { token } : { code, state };
        const data = await postWithSession(`/oauth/${p}/token`, payload);

        // 6) 전역 알림 + 힌트 저장
        try {
          sessionStorage.setItem('auth_hint', '1');
          window.dispatchEvent(new Event('auth:changed'));
        } catch {}

        // 7) (선택) 프로필 미완성 처리
        if (data?.profileIncomplete) {
          const missing = data?.missing || {};
          const parts = [
            missing.tel ? '전화번호' : null,
            missing.addr ? '주소' : null,
            missing.post ? '우편번호' : null,
          ].filter(Boolean).join(', ');
          alert(
            parts
              ? `프로필에 임시 정보(${parts})가 있어요. 업데이트해 주세요.`
              : '프로필에 임시 정보가 있어요. 업데이트해 주세요.'
          );
        }

        setMsg('로그인 성공! 이동합니다…');
        navigate('/', { replace: true });
      } catch (e) {
        setMsg(e.message || '로그인 중 오류가 발생했습니다.');
        setTimeout(() => navigate('/login', { replace: true }), 1000);
      }
    })();
  }, [navigate, p]);

  return <div style={{ padding: 24 }}>{msg}</div>;
}
