import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import SearchDropdown from './SearchDropdown';
import CartDropdown from './CartDropdown';
import UserDropdown from './UserDropdown';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLoginCart } from '../../contexts/LoginCartContext'; // 로그인 상태/회원정보 훅
import logo from '../../images/logo.png';

const Header = React.memo(() => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { isLoggedIn, member, logout } = useLoginCart(); // ★ logout 포함

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen(prev => !prev);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleCartToggle = useCallback(() => {
    if (!isLoggedIn) {
      // ★ App 라우트와 통일된 경로로 이동
      navigate('/loginForm');
      return;
    }
    setIsCartOpen(prev => !prev);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [isLoggedIn, navigate]);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const handleUserMenuToggle = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
    setIsSearchOpen(false);
    setIsCartOpen(false);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // ★ 로그아웃 처리: 세션 종료 후 홈으로 이동 + 드롭다운/패널 닫기
  const handleLogout = useCallback(async () => {
    try {
      await logout(); // useLoginCart: 서버 /member/logout + auth:changed 이벤트
    } finally {
      setIsUserMenuOpen(false);
      setIsCartOpen(false);
      setIsSearchOpen(false);
      navigate('/');
    }
  }, [logout, navigate]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* 모바일 햄버거 메뉴 버튼 */}
          <button
            className={styles.mobileMenuButton}
            onClick={handleMobileMenuToggle}
            aria-label="메뉴 열기"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.active : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.active : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.active : ''}`}></span>
          </button>

          {/* 로고 */}
          <div className={styles.logoSection} onClick={handleLogoClick}>
            <img src={logo} alt="도담도담" className={styles.logo} />
          </div>

          {/* 데스크톱 네비게이션 */}
          <Navigation />

          {/* 유틸리티 메뉴 */}
          <div className={styles.utilitySection}>
            {/* 검색 버튼 */}
            <button
              className={`${styles.utilityButton} ${isSearchOpen ? styles.active : ''}`}
              onClick={handleSearchToggle}
              aria-label="검색"
              aria-expanded={isSearchOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* 장바구니 버튼: 로그인시에만 표시 */}
            {isLoggedIn && (
              <button
                className={`${styles.utilityButton} ${isCartOpen ? styles.active : ''}`}
                onClick={handleCartToggle}
                aria-label="장바구니"
                aria-expanded={isCartOpen}
              >
                <div className={styles.cartIconWrapper}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 22a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M20 22a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  {totalItems > 0 && (
                    <span className={styles.cartBadge}>
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
              </button>
            )}

            {/* 유저 메뉴 버튼 (항상 보임, 내부에서 분기 처리) */}
            <button
              className={`${styles.utilityButton} ${isUserMenuOpen ? styles.active : ''}`}
              onClick={handleUserMenuToggle}
              aria-label="마이페이지"
              aria-expanded={isUserMenuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {/* 다크모드 토글 */}
            <button
              className={styles.utilityButton}
              onClick={handleThemeToggle}
              aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        onToggle={handleMobileMenuToggle}
      />

      {/* 드롭다운들 */}
      <SearchDropdown isOpen={isSearchOpen} onClose={handleSearchClose} />

      {/* 장바구니 드롭다운: 로그인시에만 표시 */}
      {isLoggedIn && (
        <CartDropdown
          isOpen={isCartOpen}
          onClose={handleCartClose}
        />
      )}

      {/* 유저 드롭다운 */}
      <UserDropdown
        isOpen={isUserMenuOpen}
        onClose={handleUserMenuClose}
        isLoggedIn={isLoggedIn}  // 로그인 여부 전달
        userInfo={member}        // 사용자 정보 전달
        onLogout={handleLogout}  // ★ 로그아웃 전달
      />
    </>
  );
});

Header.displayName = 'Header';

export default Header;
