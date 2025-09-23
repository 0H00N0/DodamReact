import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../admin/contexts/AdminContext';

export default function LogisticsGuard({ children }) {
  const { state } = useAdmin();
  const loc = useLocation();
  const user = state?.user;
  const isAuth = !!user;
  const mtcode = user?.memtype?.mtcode ?? user?.mtcode;
  const isDeliveryman = mtcode === 3 || user?.role === 'DELIVERYMAN';

  if (!isAuth) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (!isDeliveryman) return <Navigate to="/" replace />;
  return children;
}
