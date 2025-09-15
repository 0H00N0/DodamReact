import React, { useState } from 'react';

function randomState() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function kakaoAuthUrl() {
  const clientId = process.env.REACT_APP_KAKAO_REST_KEY;
  const redirect = `${process.env.REACT_APP_REDIRECT_BASE}/oauth/callback/kakao`;
  return `https://kauth.kakao.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&response_type=token`;
}

function naverAuthUrl() {
  const clientId = process.env.REACT_APP_NAVER_CLIENT_ID;
  const redirect = `${process.env.REACT_APP_REDIRECT_BASE}/oauth/callback/naver`;
  const state = randomState();
  sessionStorage.setItem('naver_oauth_state', state);
  return `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&state=${encodeURIComponent(state)}`;
}

export default function SocialLogin() {
  const [loading, setLoading] = useState(false);

  const goKakao = () => {
    setLoading(true);
    window.location.href = kakaoAuthUrl();
  };
  const goNaver = () => {
    setLoading(true);
    window.location.href = naverAuthUrl();
  };

  return (
    <div style={{ display:'grid', gap:12, padding:24, maxWidth:360, margin:'40px auto' }}>
      <h2>소셜 로그인</h2>
      <button disabled={loading} onClick={goKakao}>카카오로 로그인</button>
      <button disabled={loading} onClick={goNaver}>네이버로 로그인</button>
      {loading && <small>리다이렉트 중…</small>}
    </div>
  );
}
