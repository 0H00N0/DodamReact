// AdminSideBar.js (기존 유지, 하지만 users 서브메뉴에 '회원 목록'으로 변경)
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';

/**
 * 관리자 사이드바 네비게이션 컴포넌트
 */
function AdminSidebar() {
  const { sidebarCollapsed } = useAdmin();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  // 서브메뉴 토글
  const toggleSubmenu = (menuKey) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuKey)) {
      newExpanded.delete(menuKey);
    } else {
      newExpanded.add(menuKey);
    }
    setExpandedMenus(newExpanded);
  };

  // 메뉴 아이템 정의
  const menuItems = [
    {
      key: 'dashboard',
      title: '대시보드',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      path: '/admin/dashboard'
    },
    {
      key: 'products',
      title: '상품 관리',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path 
            d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      path: '/admin/products',
      submenu: [
        { title: '상품 목록', path: '/admin/products' },
        { title: '상품 등록', path: '/admin/products/new' },
        { title: '재고 관리', path: '/admin/products/inventory' }
      ]
    },
    {
      key: 'orders',
      title: '주문 관리',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          {/* SVG 아이콘 코드 */}
        </svg>
      ),
      path: '/admin/orders', // 기본 경로
      // ⬇️ 아래 submenu 배열을 추가합니다. ⬇️
      submenu: [
        { title: '대여 목록', path: '/admin/orders/list' },
        { title: '대여 승인', path: '/admin/orders/approval' },
        { title: '배송 중/완료', path: '/admin/orders/shipping' },
        { title: '회수', path: '/admin/orders/returns' },
        { title: '연체', path: '/admin/orders/overdue' },
        { title: '손실/분실', path: '/admin/orders/lost' },
        { title: '연장', path: '/admin/orders/extended' }, // 새 서브메뉴 추가
      ]
    },
    {
      key: 'users',
      title: '회원 관리', // 사용자 -> 회원으로 변경
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path 
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      path: '/admin/users',
      submenu: [
        { title: '회원 목록', path: '/admin/users' }, // 사용자 -> 회원으로 변경
        { title: '관리자 계정', path: '/admin/users/admins' }
      ]
    },
    {
      key: 'boards',
      title: '게시판 관리',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9">
          </path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z">
          </path>
        </svg>
      ),
      path: '/admin/boards'
    },
    {
      key: 'voc',
      title: 'VOC 관리',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      path: '/admin/voc'
    },
    {
      key: 'plans',
      title: '구독 플랜 관리',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      path: '/admin/plans',
      submenu: [
        { title: '플랜 목록', path: '/admin/plans' },
        { title: '플랜 등록', path: '/admin/plans/new' }
      ]
    },
    {
      key: 'categories',
      title: '카테고리 관리',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path 
            d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" 
            stroke="currentColor" 
            strokeWidth="2"
          />
        </svg>
      ),
      path: '/admin/categories'
    },
    {
      key: 'statistics',
      title: '통계',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="20" x2="12" y2="10" stroke="currentColor" strokeWidth="2"/>
          <line x1="18" y1="20" x2="18" y2="4" stroke="currentColor" strokeWidth="2"/>
          <line x1="6" y1="20" x2="6" y2="16" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      path: '/admin/statistics',
      submenu: [
        { title: '매출 통계', path: '/admin/statistics/sales' },
        { title: '상품 통계', path: '/admin/statistics/products' },
        { title: '사용자 통계', path: '/admin/statistics/users' }
      ]
    },
    {
      key: 'deliverymen',
      title: '배송기사 관리',
      
      path: '/admin/deliverymen'
}
  ];

  // 활성 메뉴 확인
  const isMenuActive = (menuItem) => {
  if (menuItem.submenu) {
    // 서브메뉴는 기존 그대로 두되, startsWith로도 보완해도 됨
    return menuItem.submenu.some(sub =>
      location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
    );
  }
  // 단일 메뉴: 기본 경로 OR 하위 경로도 활성 처리
  return location.pathname === menuItem.path || location.pathname.startsWith(menuItem.path + '/');
};

  return (
    <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map(item => (
            <li key={item.key} className="nav-item">
              {item.submenu ? (
                <>
                  <button 
                    className={`nav-link expandable ${isMenuActive(item) ? 'active' : ''}`}
                    onClick={() => toggleSubmenu(item.key)}
                    aria-expanded={expandedMenus.has(item.key)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="nav-title">{item.title}</span>
                        <svg 
                          className={`expand-icon ${expandedMenus.has(item.key) ? 'expanded' : ''}`}
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none"
                        >
                          <path 
                            d="M6 9l6 6 6-6" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                  {!sidebarCollapsed && expandedMenus.has(item.key) && (
                    <ul className="submenu">
                      {item.submenu.map(subItem => (
                        <li key={subItem.path}>
                          <NavLink 
                            to={subItem.path}
                            className={({ isActive }) => 
                              `submenu-link ${isActive ? 'active' : ''}`
                            }
                          >
                            {subItem.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="nav-title">{item.title}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* 사이드바 하단 정보 */}
      {!sidebarCollapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-info">
            <p className="version">버전 1.0.0</p>
            <p className="copyright">© 2024 Admin Panel</p>
          </div>
        </div>
      )}
    </aside>
  );
}

export default AdminSidebar;