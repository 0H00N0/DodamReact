import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './Admin.css';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSideBar';
import { AdminProvider } from './contexts/AdminContext';

// 존재하는 페이지만 import
const Dashboard = React.lazy(() => import('./Dashboard'));
const ProductManagement = React.lazy(() => import('./ProductManagement'));

// 로딩 컴포넌트
const AdminLoadingSpinner = () => (
  <div className="admin-loading-container">
    <div className="admin-loading-spinner">
      <div className="spinner"></div>
      <span>관리자 페이지 로딩 중...</span>
    </div>
  </div>
);

/**
 * 관리자 메인 컴포넌트
 * 관리자 전용 레이아웃과 라우팅을 관리
 */
function Admin() {
  return (
    <AdminProvider>
      <div className="admin-container">
        {/* 관리자 헤더 */}
        <AdminHeader />
        
        <div className="admin-main-wrapper">
          {/* 사이드바 네비게이션 */}
          <AdminSidebar />
          
          {/* 메인 콘텐츠 영역 */}
          <main className="admin-main-content">
            <Suspense fallback={<AdminLoadingSpinner />}>
              <Routes>
                {/* 기본 경로 */}
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                
                {/* 대시보드 */}
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* 상품 관리 */}
                <Route path="products/*" element={<ProductManagement />} />
                
                {/* 404 페이지 */}
                <Route path="*" element={<div className="admin-404">페이지를 찾을 수 없습니다.</div>} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}

export default Admin;