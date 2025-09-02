import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserDropdown.module.css';

const UserDropdown = ({ isOpen, onClose, isLoggedIn = false, userInfo }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // ---- 라우팅 헬퍼들 ----
  const go = (path) => () => { navigate(path); onClose(); };
  const serverGo = (path) => () => { window.location.href = path; }; // 서버 쪽에서 처리 후 리다이렉트

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dropdownRef}
        className={styles.dropdown}
        onClick={(e) => e.stopPropagation()}
      >
        {!isLoggedIn ? (
          <div className={styles.loginSection}>
            <div className={styles.welcomeMessage}>
              <h3 className={styles.title}>로그인이 필요합니다</h3>
              <p className={styles.subtitle}>로그인하고 다양한 혜택을 만나보세요</p>
            </div>

            <div className={styles.authButtons}>
              <button onClick={go('/loginForm')} className={styles.loginButton}>
                로그인
              </button>
              <button onClick={go('/signup')} className={styles.signupButton}>
                회원가입
              </button>
            </div>

          </div>
        ) : (
          <div className={styles.userSection}>
            <div className={styles.userProfile}>
              <div className={styles.profileImage}>
                {userInfo?.profileImage ? (
                  <img src={userInfo.profileImage} alt="프로필" />
                ) : (
                  /* 기본 아이콘 SVG */
                  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <div className={styles.userInfo}>
                <h3 className={styles.userName}>{userInfo?.name ?? '회원'}</h3>
                <p className={styles.userEmail}>{userInfo?.email ?? ''}</p>
              </div>
            </div>

            <div className={styles.menuList}>
              <button onClick={go('/member/profile')} className={styles.menuItem}>마이페이지</button>
              <button onClick={go('/member/ordersList')} className={styles.menuItem}>주문내역</button>
              <button onClick={go('/member/cart')} className={styles.menuItem}>장바구니</button>
              <button onClick={go('/member/membership')} className={styles.menuItem}>구독확인</button>
              <button onClick={go('/member/cash')} className={styles.menuItem}>결제수단조회</button>
              <button onClick={go('/member/inquiryList')} className={styles.menuItem}>문의내역</button>
              <button onClick={go('/member/reviewList')} className={styles.menuItem}>리뷰내역</button>
              <button onClick={go('/member/returnList')} className={styles.menuItem}>반품조회</button>
              <button onClick={go('/member/tradeList')} className={styles.menuItem}>교환조회</button>
            </div>

            <div className={styles.logoutSection}>
              {/* 서버 로그아웃 엔드포인트가 /member/auth/logout 이라면 */}
              <button onClick={serverGo('/member/auth/logout')} className={styles.logoutButton}>
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;
