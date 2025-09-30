import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./PlanManagement.css";

const PlanList = React.lazy(() => import("./PlanList"));
const PlanForm = React.lazy(() => import("./PlanForm"));
const PlanDetail = React.lazy(() => import("./PlanDetail")); // 추가
const PlanMembers = React.lazy(() => import("./PlanMembers"));   // 🔥 추가
const PlanInvoices = React.lazy(() => import("./PlanInvoices")); // 🔥 추가

function PlanManagement() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<PlanList />} />
        <Route path="new" element={<PlanForm />} />
        <Route path="edit/:planId" element={<PlanForm />} />
        <Route path=":planId" element={<PlanDetail />} /> {/* 상세 조회 추가 */}
        <Route path="members" element={<PlanMembers />} />    {/* 🔥 추가 */}
        <Route path="invoices" element={<PlanInvoices />} />  {/* 🔥 추가 */}
      </Routes>
    </Suspense>
  );
}

export default PlanManagement;
