import React from 'react';
import { useAdmin } from './contexts/AdminContext';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 보호된 라우트 컴포넌트
 * 인증되지 않은 사용자를 로그인 페이지로 리다이렉트합니다.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdmin();
  const location = useLocation();

  // 인증 상태를 확인하는 동안 로딩 표시
  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-spinner">
          <div className="spinner"></div>
          <span>인증 확인 중...</span>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우, 로그인 페이지로 리디렉션
  // 원래 가려던 경로를 state에 저장하여 로그인 후 돌아올 수 있도록 함
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 인증된 사용자에게는 요청된 컴포넌트 렌더링
  return children;
}

export default ProtectedRoute;