// src/main/frontend/.../OrderManagement.js
import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import OrderDetail from './OrderDetail';
import './OrderManagement.css';

const OrderTable = ({ title, orders }) => {
  const columns = [
    { header: '주문번호', accessor: o => <Link to={`/admin/orders/${o.renNum}`}>{o.renNum}</Link> },
    { header: '주문자명', accessor: o => o.mid || '미정' },
    { header: '상품명', accessor: o => o.prodName || '미정' },
    { header: '대여일', accessor: o => o.rentalDate ? new Date(o.rentalDate).toLocaleDateString() : '-' },
    { header: '반납일', accessor: o => o.returnDate ? new Date(o.returnDate).toLocaleDateString() : '미정' },
    { header: '배송상태', accessor: o => {
      const statusMap = {
        'PENDING': '대기중',
        'SHIPPING': '배송중',
        'DELIVERED': '배송완료',
        'RETURNED': '반납완료'
      };
      return statusMap[o.status] || o.status || '미정';
    }},
    { header: '운송장', accessor: o => o.trackingNum || '미입력' },
  ];

  return (
    <div className="order-content-area">
      <h3>{title}</h3>
      <div className="order-table-container">
        <table className="order-table">
          <thead>
            <tr>{columns.map((c, i) => <th key={i}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {orders?.length ? orders.map(o => (
              <tr key={o.renNum}>
                {columns.map((c, i) => <td key={i}>{c.accessor(o)}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="no-data">주문이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const { getAllOrders } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('주문 목록 조회 시작');
      const data = await getAllOrders();
      console.log('받은 주문 데이터:', data);
      if (!data) {
        throw new Error('주문 데이터가 없습니다');
      }
      setOrders(Array.isArray(data) ? data : data.content || []);
    } catch (e) {
      console.error('주문 목록 조회 실패:', e);
      setError(e.message || '주문 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [getAllOrders]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) return <div className="loading-message">로딩 중…</div>;
  if (error) return <div className="loading-message">{error}</div>;

  return (
    <div className="order-management-container">
      <OrderTable title="전체 대여 목록" orders={orders} />
    </div>
  );
};

export default OrderManagement;
