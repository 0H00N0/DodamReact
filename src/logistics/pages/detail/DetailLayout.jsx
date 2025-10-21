import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function DetailLayout() {
  const base = '/logistics/detail';
  const Tab = ({ to, children }) => (
    <NavLink to={to} className={({isActive}) =>
      `px-3 py-2 rounded border ${isActive ? 'bg-gray-200 font-semibold' : 'bg-white hover:bg-gray-50'}`}>{children}
    </NavLink>
  );
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">배송상세</h1>
      <div className="flex gap-2 mb-6">
        <Tab to={`${base}/products`}>상품확인</Tab>
        <Tab to={`${base}/customer`}>고객정보</Tab>
      </div>
      <Outlet />
    </div>
  );
}
