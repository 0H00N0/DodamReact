import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserDropdown.module.css';

const UserDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // 사용자 로그인 상태 (실제 구현에서는 상태 관리를 통해 처리)
  const isLoggedIn = false; // 임시로 false 설정
  
  const userInfo = {
    name: '김도담',
    email: 'dodam@example.com',
    profileImage: null
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleWishlist = () => {
    navigate('/wishlist');
    onClose();
  };

  const handleCart = () => {
    navigate('/cart');
    onClose();
  };

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  const handleSignup = () => {
    navigate('/signup');
    onClose();
  };

  const handleMenuClick = (menuName) => {
    alert(`${menuName} 기능은 준비 중입니다!`);
    onClose();
  };

  const handleLogout = () => {
    alert('로그아웃되었습니다!');
    // 실제 구현에서는 로그아웃 로직 추가
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        ref={dropdownRef} 
        className={styles.dropdown}
        onClick={(e) => e.stopPropagation()}
      >
        {!isLoggedIn ? (
          // 로그인하지 않은 상태
          <div className={styles.loginSection}>
            <div className={styles.welcomeMessage}>
              <h3 className={styles.title}>로그인이 필요합니다</h3>
              <p className={styles.subtitle}>
                로그인하고 다양한 혜택을 만나보세요
              </p>
            </div>
            
            <div className={styles.authButtons}>
              <button 
                onClick={handleLogin}
                className={styles.loginButton}
              >
                로그인
              </button>
              <button 
                onClick={handleSignup}
                className={styles.signupButton}
              >
                회원가입
              </button>
            </div>
            
            <div className={styles.quickLinks}>
              <button 
                onClick={handleWishlist}
                className={styles.quickLink}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                찜한상품
              </button>
              <button 
                onClick={handleCart}
                className={styles.quickLink}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 22a1 1 0 100-2 1 1 0 000 2z"/>
                  <path d="M20 22a1 1 0 100-2 1 1 0 000 2z"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
                장바구니
              </button>
            </div>
          </div>
        ) : (
          // 로그인한 상태
          <div className={styles.userSection}>
            <div className={styles.userProfile}>
              <div className={styles.profileImage}>
                {userInfo.profileImage ? (
                  <img src={userInfo.profileImage} alt="프로필" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              <div className={styles.userInfo}>
                <h3 className={styles.userName}>{userInfo.name}</h3>
                <p className={styles.userEmail}>{userInfo.email}</p>
              </div>
            </div>
            
            <div className={styles.menuList}>
              <button 
                onClick={() => handleMenuClick('마이페이지')}
                className={styles.menuItem}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                마이페이지
              </button>
              
              <button 
                onClick={() => handleMenuClick('주문내역')}
                className={styles.menuItem}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                주문내역
              </button>
              
              <button 
                onClick={handleWishlist}
                className={styles.menuItem}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                찜한상품
              </button>
              
              <button 
                onClick={() => handleMenuClick('쿠폰함')}
                className={styles.menuItem}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a2 2 0 01-2-2V4a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 01-2 2 2 2 0 012 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 012-2z"/>
                  <circle cx="12" cy="12" r="1"/>
                </svg>
                쿠폰함
              </button>
              
              <button 
                onClick={() => handleMenuClick('고객센터')}
                className={styles.menuItem}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
                고객센터
              </button>
            </div>
            
            <div className={styles.logoutSection}>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
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