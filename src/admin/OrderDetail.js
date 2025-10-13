// src/main/frontend/.../OrderDetail.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useAdmin();

  // 숫자만 유효
  const isNumericId = /^\d+$/.test(String(orderId ?? ''));

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isNumericId) {
        navigate('/admin/orders/list', { replace: true });
        return;
      }

      const data = await getOrderById(Number(orderId));
      console.log('받아온 주문 데이터:', data); // 디버깅용 로그 추가
      
      if (!data) {
        setError('주문 데이터를 불러올 수 없습니다.');
        return;
      }
      
      setOrder(data);
    } catch (e) {
      console.error('주문 상세 정보 조회 실패:', e);
      setError('주문 정보를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [isNumericId, orderId, getOrderById, navigate]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  if (loading) return <div className="order-detail-container"><h2>불러오는 중…</h2></div>;
  if (error || !order) return <div className="order-detail-container"><h2>{error || '주문 정보를 찾을 수 없습니다.'}</h2></div>;

  return (
    <div className="order-detail-container">
      {order ? (
        <>
          <div className="order-detail-header">
            <h1>주문 상세 정보</h1>
            <Link to="/admin/orders/list" className="back-to-list-btn">목록으로</Link>
          </div>

          <div className="order-detail-grid">
            <div className="detail-card">
              <h2>주문 정보</h2>
              <p><strong>주문 번호:</strong> {order.renNum}</p>
              <p><strong>상품명:</strong> {order.productName || '정보 없음'}</p>
              <p><strong>대여일:</strong> {order.renDate ? new Date(order.renDate).toLocaleString() : '-'}</p>
              <p><strong>반납일:</strong> {order.retDate ? new Date(order.retDate).toLocaleString() : '미정'}</p>
            </div>

            <div className="detail-card">
              <h2>고객 정보</h2>
              <p><strong>고객명:</strong> {order.memberName}</p>
            </div>

            <div className="detail-card">
              <h2>배송 정보</h2>
              <p><strong>배송 상태:</strong> {order.renShip || '미입력'}</p>
              <p><strong>운송장 번호:</strong> {order.trackingNumber || '미입력'}</p>
            </div>
          </div>
        </>
      ) : (
        <div>주문 정보를 불러오는 중입니다...</div>
      )}
    </div>
  );
};

export default OrderDetail;
