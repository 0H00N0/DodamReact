import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './Admin.css';
import AdminHeader from './admin/AdminHeader';
import AdminSidebar from './admin/AdminSidebar';
import { AdminProvider } from './admin/contexts/AdminContext';

// 관리자 페이지 동적 import
const Dashboard = React.lazy(() => import('./admin/Dashboard'));
const ProductManagement = React.lazy(() => import('./admin/ProductManagement'));
const OrderManagement = React.lazy(() => import('./admin/OrderManagement'));
const UserManagement = React.lazy(() => import('./admin/UserManagement'));
const CategoryManagement = React.lazy(() => import('./admin/CategoryManagement'));
const Statistics = React.lazy(() => import('./admin/Statistics'));

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
                {/* 기본 경로는 대시보드로 리디렉션 */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* 대시보드 */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* 상품 관리 */}
                <Route path="/products/*" element={<ProductManagement />} />
                
                {/* 주문 관리 */}
                <Route path="/orders/*" element={<OrderManagement />} />
                
                {/* 사용자 관리 */}
                <Route path="/users/*" element={<UserManagement />} />
                
                {/* 카테고리 관리 */}
                <Route path="/categories/*" element={<CategoryManagement />} />
                
                {/* 통계 */}
                <Route path="/statistics" element={<Statistics />} />
                
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