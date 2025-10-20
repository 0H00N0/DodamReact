import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Item = ({ to, children, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `block px-3 py-2 rounded ${isActive ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`
    }>
    {children}
  </NavLink>
);

export default function LogisticsLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <h2 className="text-xl font-bold mb-4">배달 업무</h2>
        <nav className="space-y-1">
          <Item to="/logistics" end>배송기사페이지</Item>
          <Item to="/logistics/today">당일배송일정</Item>
          <Item to="/logistics/area">배송지역관리</Item>
          <Item to="/logistics/map">배송지도</Item>
          <Item to="/logistics/detail">배송상세</Item>
          <Item to="/logistics/customer">고객정보</Item>
          <Item to="/logistics/return">반납</Item>
          <Item to="/logistics/management">업무관리</Item>
          <Item to="/logistics/result">배송실적조회</Item>
          <Item to="/logistics/charges">배송료 정산</Item>
        </nav>
      </aside>
      <main className="flex-1 p-6"><Outlet /></main>
    </div>
  );
}
