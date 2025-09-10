// Admin.js

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './Admin.css';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSideBar';

// 관리자 페이지 컴포넌트들
const Dashboard = React.lazy(() => import('./Dashboard'));
const UserManagement = React.lazy(() => import('./UserManagement'));
// 다른 관리자 페이지들도 여기에 추가할 수 있습니다.
// const ProductManagement = React.lazy(() => import('./ProductManagement'));
// const PlanManagement = React.lazy(() => import('./PlanManagement'));


// 로딩 스피너 컴포넌트
const AdminLoadingSpinner = () => (
  <div className="admin-loading-container">
    <div className="admin-loading-spinner">
      <div className="spinner"></div>
      <span>관리자 페이지 로딩 중...</span>
    </div>
  </div>
);

/**
 * ✅ 수정된 Admin 컴포넌트
 * 이제 이 컴포넌트는 관리자 페이지의 전체 레이아웃과 내부 라우팅만을 담당합니다.
 */
function Admin() {
  return (
    <div className="admin-container">
      <AdminHeader />
      <div className="admin-main-wrapper">
        <AdminSidebar />
        <main className="admin-main-content">
          <Suspense fallback={<AdminLoadingSpinner />}>
            <Routes>
              {/* /admin 경로로 접속 시 /admin/dashboard로 자동 이동 */}
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              
              {/* 각 관리자 페이지 경로 설정 */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users/*" element={<UserManagement />} />
              {/* <Route path="products/*" element={<ProductManagement />} /> */}
              {/* <Route path="plans/*" element={<PlanManagement />} /> */}

              {/* 일치하는 경로가 없을 때 보여줄 404 페이지 */}
              <Route path="*" element={
                <div className="admin-404">
                  <h2>페이지를 찾을 수 없습니다.</h2>
                  <p>요청하신 페이지가 존재하지 않습니다.</p>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default Admin;