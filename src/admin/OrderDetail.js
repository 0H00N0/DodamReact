import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orders as dummyOrders } from '../utils/dummyData';
import './OrderDetail.css';

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [showShippingForm, setShowShippingForm] = useState(false);

    useEffect(() => {
        // In a real app, you would fetch this data from an API
        const foundOrder = dummyOrders.find(o => o.id === orderId);
        setOrder(foundOrder);
    }, [orderId]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case '승인대기': return 'pending';
            case '배송중': return 'shipping';
            case '대여중': return 'renting';
            case '반납완료': return 'returned';
            case '연체': return 'overdue';
            case '파손': return 'damaged';
            default: return '';
        }
    };

    if (!order) {
        return <div className="order-detail-container"><h2>주문 정보를 찾을 수 없습니다.</h2></div>;
    }

    return (
        <div className="order-detail-container">
            <div className="order-detail-header">
                <h1>주문 상세 정보</h1>
                <Link to="/admin/orders" className="back-to-list-btn">목록으로 돌아가기</Link>
            </div>

            <div className="order-detail-grid">
                <div className="detail-card">
                    <h2>주문 정보</h2>
                    <p><strong>주문 번호:</strong> {order.id}</p>
                    <p><strong>상품명:</strong> {order.productName}</p>
                    <p><strong>대여 기간:</strong> {order.rentalStartDate} ~ {order.rentalEndDate}</p>
                    <p><strong>상태:</strong> 
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                        </span>
                    </p>
                </div>

                <div className="detail-card">
                    <h2>고객 정보</h2>
                    <p><strong>고객명:</strong> {order.userName}</p>
                    <p><strong>고객 ID:</strong> {order.userId}</p>
                    <p><strong>배송 주소:</strong> {order.shippingInfo.address}</p>
                </div>

                <div className="detail-card">
                    <h2>배송 정보</h2>
                    <p><strong>택배사:</strong> {order.shippingInfo.courier || '미입력'}</p>
                    <p><strong>운송장 번호:</strong> {order.shippingInfo.trackingNumber || '미입력'}</p>
                </div>

                <div className="detail-card order-actions">
                    <h2>주문 처리</h2>
                    {order.status === '승인대기' && (
                        <button className="action-approve-btn">대여 승인</button>
                    )}
                    {order.status === '배송중' && !order.shippingInfo.trackingNumber && (
                        <button className="action-shipping-btn" onClick={() => setShowShippingForm(!showShippingForm)}>
                            운송장 정보 입력
                        </button>
                    )}
                    {showShippingForm && (
                        <form className="shipping-form">
                            <input type="text" placeholder="택배사" />
                            <input type="text" placeholder="운송장 번호" />
                            <button type="submit" className="action-shipping-btn">저장</button>
                        </form>
                    )}
                     {(order.status !== '승인대기' && order.status !== '배송중') && (
                        <p>완료된 주문입니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
