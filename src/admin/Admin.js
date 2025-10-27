// Admin.js
import React from "react";
import { Outlet } from "react-router-dom";
import "./Admin.css";
import "./Admin.pink.css";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSideBar";

function Admin() {
  return (
     <div className="admin-pink-theme">
      <AdminHeader />
      <div className="admin-main-wrapper">
        <AdminSidebar />
        <main className="admin-main-content">
          <Outlet /> {/* ✅ 내부 서브라우트가 이곳에 렌더링됨 */}
        </main>
      </div>
    </div>
  );
}

export default Admin;
