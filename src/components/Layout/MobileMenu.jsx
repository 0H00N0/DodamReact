import React, { useState, useEffect } from 'react';
import styles from './MobileMenu.module.css';

/**
 * 모바일 햄버거 메뉴 및 드로어 네비게이션 컴포넌트
 * 터치 친화적인 인터랙션과 접근성을 고려한 설계
 */
const MobileMenu = ({ isOpen, onClose, onToggle }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const navigationItems = [
    {
      id: 'toys',
      title: '장난감',
      icon: '🧸',
      children: [
        { name: '블록/조립완구', icon: '🧩' },
        { name: '인형/피규어', icon: '🎎' },
        { name: '역할놀이', icon: '👩‍⚕️' },
        { name: '교육완구', icon: '📚' },
        { name: '보드게임', icon: '🎲' },
        { name: '야외놀이', icon: '⚽' }
      ]
    },
    {
      id: 'age',
      title: '연령별',
      icon: '👶',
      children: [
        { name: '0-12개월', icon: '🍼' },
        { name: '12-24개월', icon: '🚼' },
        { name: '2-3세', icon: '🎈' },
        { name: '4-5세', icon: '🎨' },
        { name: '6-7세', icon: '📝' },
        { name: '8세 이상', icon: '🎯' }
      ]
    },
    {
      id: 'brand',
      title: '브랜드',
      icon: '🏷️',
      children: [
        { name: '레고', icon: '🔴' },
        { name: '플레이모빌', icon: '🔵' },
        { name: '토이스토리', icon: '🤠' },
        { name: '디즈니', icon: '🏰' },
        { name: '뽀로로', icon: '🐧' },
        { name: '타요', icon: '🚌' }
      ]
    },
    {
      id: 'new',
      title: '신상품',
      icon: '⭐',
      children: []
    }
  ];

  // 메뉴가 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleMenuToggle = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.mobileMenuOverlay} onClick={handleBackdropClick}>
      <div className={styles.mobileMenuDrawer}>
        {/* 헤더 */}
        <div className={styles.mobileMenuHeader}>
          <h2 className={styles.menuTitle}>메뉴</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="메뉴 닫기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className={styles.mobileNav}>
          <ul className={styles.navList}>
            {navigationItems.map((item) => (
              <li key={item.id} className={styles.navItem}>
                {item.children.length > 0 ? (
                  <>
                    <button
                      className={`${styles.navButton} ${expandedMenu === item.id ? styles.expanded : ''}`}
                      onClick={() => handleMenuToggle(item.id)}
                      aria-expanded={expandedMenu === item.id}
                      aria-controls={`submenu-${item.id}`}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navText}>{item.title}</span>
                      <svg 
                        className={styles.expandIcon}
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </button>
                    
                    {/* 서브메뉴 */}
                    <div 
                      id={`submenu-${item.id}`}
                      className={`${styles.submenu} ${expandedMenu === item.id ? styles.open : ''}`}
                    >
                      <ul className={styles.submenuList}>
                        {item.children.map((child, index) => (
                          <li key={index} className={styles.submenuItem}>
                            <a
                              href={`/${item.id}/${child.name}`}
                              className={styles.submenuLink}
                              onClick={handleLinkClick}
                            >
                              <span className={styles.submenuIcon}>{child.icon}</span>
                              <span className={styles.submenuText}>{child.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <a
                    href={`/${item.id}`}
                    className={styles.navLink}
                    onClick={handleLinkClick}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navText}>{item.title}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* 추가 메뉴 */}
        <div className={styles.additionalMenu}>
          <div className={styles.utilityButtons}>
            <button className={styles.utilityButton} onClick={handleLinkClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span>검색</span>
            </button>
            
            <button className={styles.utilityButton} onClick={handleLinkClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 22a1 1 0 100-2 1 1 0 000 2z"/>
                <path d="M20 22a1 1 0 100-2 1 1 0 000 2z"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              <span>장바구니</span>
            </button>
            
            <button className={styles.utilityButton} onClick={handleLinkClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>마이페이지</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;