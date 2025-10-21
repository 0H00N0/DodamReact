import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from './contexts/AdminContext';

/**
 * 관리자 헤더 컴포넌트
 * 사용자 정보, 알림, 검색 기능 포함
 */
function AdminHeader() {
  const { user, notifications, toggleSidebar, logout, removeNotification } = useAdmin();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 실제로는 검색 페이지로 이동하거나 검색 결과 표시
      console.log('검색어:', searchQuery);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      logout();
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        {/* 사이드바 토글 버튼 */}
        <button 
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="사이드바 토글"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M3 12h18M3 6h18M3 18h18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 로고 */}
        <div className="admin-logo">
          <h1>관리자 패널</h1>
        </div>
      </div>

      <div className="admin-header-center">
        {/* 검색 바 */}
        <form className="admin-search" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              placeholder="상품, 주문, 사용자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>

      <div className="admin-header-right">
        {/* 알림 */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`알림 ${notifications?.length || 0}개`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            {notifications?.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )}
          </button>

          {/* 알림 드롭다운 */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>알림</h3>
                {notifications?.length > 0 && (
                  <button 
                    className="clear-all-btn"
                    onClick={() => notifications.forEach(n => removeNotification(n.id))}
                  >
                    모두 삭제
                  </button>
                )}
              </div>
              <div className="notification-list">
                {!notifications || notifications.length === 0 ? (
                  <div className="no-notifications">새로운 알림이 없습니다</div>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.type}`}>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <small>{new Date(notification.timestamp).toLocaleString()}</small>
                      </div>
                      <button 
                        className="remove-notification-btn"
                        onClick={() => removeNotification(notification.id)}
                        aria-label="알림 삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 사용자 메뉴 */}
        <div className="user-menu-wrapper" ref={userMenuRef}>
          <button 
            className="user-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="사용자 메뉴"
          >
            <div className="user-avatar">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
            </div>
            <span className="user-name">{user?.name || user?.username || '관리자'}</span>
            <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path 
                d="M6 9l6 6 6-6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 사용자 드롭다운 메뉴 */}
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-avatar large">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </div>
                <div className="user-details">
                  <p className="user-name">{user?.name || user?.username || '관리자'}</p>
                  <p className="user-email">{user?.email || 'admin@example.com'}</p>
                  <p className="user-role">{user?.role || 'ADMIN'}</p>
                </div>
              </div>
              <hr />
              <ul className="user-menu-list">
                <li>
                  <button className="menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      />
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    프로필 설정
                  </button>
                </li>
                <li>
                  <button className="menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path 
                        d="M12 1v6m0 6v6m11-7h-6m-6 0H1" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      />
                    </svg>
                    설정
                  </button>
                </li>
                <li>
                  <button className="menu-item logout" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      />
                    </svg>
                    로그아웃
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;