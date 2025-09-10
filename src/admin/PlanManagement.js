// PlanManagement.js
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import './PlanManagement.css'; // 스타일 import

const PlanList = React.lazy(() => import('./PlanList'));
const PlanForm = React.lazy(() => import('./PlanForm'));

function PlanManagement() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<PlanList />} />
        <Route path="new" element={<PlanForm />} />
        <Route path="edit/:planId" element={<PlanForm />} />
      </Routes>
    </Suspense>
  );
}

export default PlanManagement;