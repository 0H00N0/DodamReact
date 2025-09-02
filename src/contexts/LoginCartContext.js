import { useState, useEffect } from 'react';

export const useLoginCart = () => {
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    //로그인 여부 판단 세션상태
    const isLoggedIn = !!localStorage.getItem('accessToken');

     useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/member/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 토큰 기반이면 아래 추가
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'include', // 세션 기반이면 필요
        });

        if (!response.ok) {
          throw new Error('프로필 불러오기 실패');
        }

        const data = await response.json();
        setMember(data); // 서버에서 반환된 {id, name, email, ...}
      } catch (err) {
        console.error('프로필 불러오기 에러:', err);
        setMember(null);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchUserProfile();
    } else {
      setMember(null);
      setLoading(false);
    }
  }, [isLoggedIn]);

  return { isLoggedIn, member, loading };
};