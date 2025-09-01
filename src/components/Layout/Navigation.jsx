import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../utils/dummyData';
import styles from './Navigation.module.css';

const Navigation = React.memo(() => {
  const [activeMenu, setActiveMenu] = useState(null);

  const navigationItems = useMemo(() => [
    {
      id: 'categories',
      title: '카테고리',
      children: categories
    },
    {
      id: 'new',
      title: '신상품',
      to: '/search?filter=new',
      children: []
    },
    {
      id: 'best',
      title: '베스트',
      to: '/search?filter=best',
      children: []
    },
    {
      id: 'sale',
      title: '할인상품',
      to: '/search?filter=sale',
      children: []
    }
  ], []);

  const handleMouseEnter = useCallback((menuId) => {
    setActiveMenu(menuId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveMenu(null);
  }, []);

  return (
    <nav className={styles.navigation}>
      <ul className={styles.navList}>
        {navigationItems.map((item) => (
          <li 
            key={item.id}
            className={styles.navItem}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            {item.to ? (
              <Link 
                to={item.to}
                className={`${styles.navLink} ${activeMenu === item.id ? styles.active : ''}`}
              >
                {item.title}
              </Link>
            ) : (
              <span 
                className={`${styles.navLink} ${activeMenu === item.id ? styles.active : ''}`}
              >
                {item.title}
                {item.children.length > 0 && (
                  <svg 
                    className={styles.chevron} 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                )}
              </span>
            )}
            
            {/* 드롭다운 메뉴 */}
            {item.children.length > 0 && activeMenu === item.id && (
              <div className={styles.dropdown}>
                <ul className={styles.dropdownList}>
                  {item.children.map((child) => (
                    <li key={child.id} className={styles.dropdownItem}>
                      <Link 
                        to={`/category/${child.id}`} 
                        className={styles.dropdownLink}
                      >
                        <span className={styles.categoryIcon}>{child.icon}</span>
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;