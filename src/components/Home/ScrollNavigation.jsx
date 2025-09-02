import React, { useState, useEffect, useRef } from 'react';
import styles from './ScrollNavigation.module.css';

const ScrollNavigation = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef(null);

  // 네비게이션 항목 정의
  const navItems = [
    { id: 'hero', label: '홈', icon: '🏠' },
    { id: 'categories', label: '카테고리', icon: '📱' },
    { id: 'featured', label: '추천상품', icon: '⭐' },
  ];

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sections = navItems.map(item => ({
            id: item.id,
            element: document.getElementById(item.id)
          })).filter(section => section.element);

          // 네비게이션 가시성 제어 (hero 섹션을 벗어나면 표시)
          const heroSection = document.getElementById('hero');
          if (heroSection) {
            const heroRect = heroSection.getBoundingClientRect();
            setIsVisible(heroRect.bottom < window.innerHeight * 0.7);
          }

          // Sticky 상태 제어
          const scrollY = window.scrollY;
          setIsSticky(scrollY > 100);

          // 현재 보고 있는 섹션 감지 (더 정확한 감지)
          let currentSection = 'hero';
          let minDistance = Infinity;
          
          sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const distance = Math.abs(sectionCenter - viewportCenter);
            
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = section.id;
            }
          });

          setActiveSection(currentSection);
          ticking = false;
        });
        ticking = true;
      }
    };

    // 디바운스된 스크롤 이벤트 리스너
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 상태 설정

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 섹션으로 부드럽게 스크롤
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 100; // 헤더 여백 고려
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <nav 
      ref={navRef}
      className={`${styles.scrollNav} ${isSticky ? styles.sticky : ''}`}
    >
      <div className={styles.navContainer}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`${styles.navItem} ${
              activeSection === item.id ? styles.active : ''
            }`}
            aria-label={`${item.label} 섹션으로 이동`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {activeSection === item.id && (
              <div className={styles.activeIndicator} />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default ScrollNavigation;